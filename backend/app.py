from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from datetime import timedelta, datetime
import os
from dotenv import load_dotenv
app = Flask(__name__)
CORS(app)

# Configuration
load_dotenv()
app.config['MONGO_URI'] = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/hour_bank_system')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(seconds=int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRES', 3600)))

# Initialize extensions
mongo = PyMongo(app)
jwt = JWTManager(app)

# User routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if 'role' in data and data['role'] == 'faculty':
        faculty = mongo.db.faculty
        if faculty.find_one({'fid': data['fid']}):
            return jsonify({'error': 'Faculty ID already exists'}), 400
        faculty_id = faculty.insert_one({
            'fid': data['fid'],
            'name': data['name'],
            'program_id': [],
            'password': generate_password_hash(data['password'])
        }).inserted_id
        return jsonify({'message': 'Faculty registered successfully', 'faculty_id': str(faculty_id)}), 201
    else:
        students = mongo.db.students
        if students.find_one({'roll': data['roll']}):
            return jsonify({'error': 'Student roll number already exists'}), 400
        student_id = students.insert_one({
            'roll': data['roll'],
            'name': data['name'],
            'course': data['course'],
            'year': int(data['year']),
            'credits': 0,
            'attendance_percent': 0.0,
            'password': generate_password_hash(data['password'])
        }).inserted_id
        return jsonify({'message': 'Student registered successfully', 'student_id': str(student_id)}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = None
    if 'fid' in data:
        user = mongo.db.faculty.find_one({'fid': data['fid']})
    elif 'roll' in data:
        user = mongo.db.students.find_one({'roll': data['roll']})
    
    if user and check_password_hash(user['password'], data['password']):
        access_token = create_access_token(identity=str(user['_id']))
        return jsonify({'access_token': access_token, 'role': 'faculty' if 'fid' in user else 'student'}), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/user', methods=['GET'])
@jwt_required()
def get_user():
    user_id = get_jwt_identity()
    user = mongo.db.faculty.find_one({'_id': ObjectId(user_id)})
    if user:
        user['_id'] = str(user['_id'])
        del user['password']
        return jsonify({'role': 'faculty', 'user': user}), 200
    user = mongo.db.students.find_one({'_id': ObjectId(user_id)})
    if user:
        user['_id'] = str(user['_id'])
        del user['password']
        return jsonify({'role': 'student', 'user': user}), 200
    return jsonify({'error': 'User not found'}), 404

# Program routes
@app.route('/api/programs', methods=['POST'])
@jwt_required()
def create_program():
    current_user = mongo.db.faculty.find_one({'_id': ObjectId(get_jwt_identity())})
    if not current_user:
        return jsonify({'error': 'Unauthorized'}), 403

    programs = mongo.db.programs
    program_data = request.json
    program_data['faculty_id'] = current_user['fid']
    program_data['registered_ids'] = []
    program_data['attended_ids'] = []
    program_data['event_date'] = datetime.strptime(program_data['event_date'], '%Y-%m-%d')
    program_id = programs.insert_one(program_data).inserted_id
    
    # Update faculty's program_id list
    mongo.db.faculty.update_one(
        {'_id': current_user['_id']},
        {'$push': {'program_id': str(program_id)}}
    )
    
    return jsonify({'message': 'Program created successfully', 'program_id': str(program_id)}), 201

@app.route('/api/programs', methods=['GET'])
@jwt_required()
def get_programs():
    programs = list(mongo.db.programs.find())
    for program in programs:
        program['_id'] = str(program['_id'])
        program['event_date'] = program['event_date'].isoformat()
    return jsonify(programs), 200

# Transaction routes
@app.route('/api/transactions', methods=['POST'])
@jwt_required()
def create_transaction():
    current_user = mongo.db.faculty.find_one({'_id': ObjectId(get_jwt_identity())})
    if not current_user:
        return jsonify({'error': 'Unauthorized'}), 403

    transactions = mongo.db.transactions
    transaction_data = request.json
    transaction_data['date'] = datetime.utcnow()
    transaction_data['sender_id'] = current_user['fid']
    transaction_id = transactions.insert_one(transaction_data).inserted_id

    # Update student's credits
    mongo.db.students.update_one(
        {'roll': transaction_data['receiver_id']},
        {'$inc': {'credits': transaction_data['credits']}}
    )

    return jsonify({'message': 'Transaction created successfully', 'transaction_id': str(transaction_id)}), 201

@app.route('/api/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    user_id = get_jwt_identity()
    faculty = mongo.db.faculty.find_one({'_id': ObjectId(user_id)})
    if faculty:
        transactions = list(mongo.db.transactions.find({'sender_id': faculty['fid']}))
    else:
        student = mongo.db.students.find_one({'_id': ObjectId(user_id)})
        if student:
            transactions = list(mongo.db.transactions.find({'receiver_id': student['roll']}))
        else:
            return jsonify({'error': 'User not found'}), 404

    for transaction in transactions:
        transaction['_id'] = str(transaction['_id'])
        transaction['date'] = transaction['date'].isoformat()
    return jsonify(transactions), 200

# Student routes
@app.route('/api/students', methods=['GET'])
@jwt_required()
def get_students():
    students = list(mongo.db.students.find({}, {'password': 0}))
    for student in students:
        student['_id'] = str(student['_id'])
    return jsonify(students), 200

@app.route('/api/students/<roll>', methods=['GET'])
@jwt_required()
def get_student(roll):
    student = mongo.db.students.find_one({'roll': roll}, {'password': 0})
    if student:
        student['_id'] = str(student['_id'])
        return jsonify(student), 200
    return jsonify({'error': 'Student not found'}), 404

# Faculty routes
@app.route('/api/faculty', methods=['GET'])
@jwt_required()
def get_faculty_members():
    faculty = list(mongo.db.faculty.find({}, {'password': 0}))
    for member in faculty:
        member['_id'] = str(member['_id'])
    return jsonify(faculty), 200

@app.route('/api/faculty/<fid>', methods=['GET'])
@jwt_required()
def get_faculty_member(fid):
    faculty = mongo.db.faculty.find_one({'fid': fid}, {'password': 0})
    if faculty:
        faculty['_id'] = str(faculty['_id'])
        return jsonify(faculty), 200
    return jsonify({'error': 'Faculty member not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, host  = '0.0.0.0')