from flask import Blueprint, request, jsonify
from app import db
from app.models import Question, Comment
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils import assign_topics_to_question
question_bp = Blueprint('questions', __name__)


# Create a Question
@question_bp.route('/add', methods=['POST'])
@jwt_required()
def create_question():
    data = request.get_json()
    title = data.get('title')
    content = data.get('content')
    user_id = get_jwt_identity()  

    if not title or not content:
        return jsonify({"message": "Missing required fields"}), 400

    new_question = Question(title=title, content=content, user_id=user_id)
    db.session.add(new_question)
    assign_topics_to_question(new_question)

    db.session.commit()

    return jsonify({
        "message": "Question created successfully",
        "question_id": new_question.id,
        "topics": [
            {"id": topic.id, "name": topic.name}
            for topic in new_question.topics
        ]
    }), 201



# Get all Questions
@question_bp.route('/all', methods=['GET'])
def get_all_questions():
    questions = Question.query.all()
    return jsonify([q.to_dict(include_comments=True) for q in questions]), 200



# Get a Single Question by ID
@question_bp.route('/<int:question_id>', methods=['GET'])
def get_question(question_id):
    question = Question.query.get(question_id)
    if not question:
        return jsonify({"message": "Question not found"}), 404
    return jsonify(question.to_dict(include_comments=True, include_topics=True)), 200

#update a question
@question_bp.route('/<int:question_id>', methods=['PUT'])
@jwt_required()
def update_question(question_id):
    user_id = int(get_jwt_identity()) 
    question = Question.query.get_or_404(question_id)

    if question.user_id != user_id:
        return jsonify({"message": "Unauthorized"}), 403

    data = request.get_json()
    question.title = data.get('title', question.title)
    question.content = data.get('content', question.content)

    db.session.commit()
    return jsonify({"message": "Question updated successfully"}), 200

#delete a question
@question_bp.route('/<int:question_id>', methods=['DELETE'])
@jwt_required()
def delete_question(question_id):
    question = Question.query.get_or_404(question_id)
    comments = Comment.query.filter_by(question_id=question.id).all()

    for comment in comments:
        db.session.delete(comment)
    db.session.delete(question)
    db.session.commit()

    return {"message": "Question and related comments deleted"}

# add comment to a question
@question_bp.route('/<int:question_id>/comments', methods=['POST'])
@jwt_required()
def add_comment_to_question(question_id):
    data = request.get_json()
    body = data.get('body')
    user_id = get_jwt_identity()

    if not body:
        return jsonify({"message": "Missing body"}), 400

    comment = Comment(body=body, question_id=question_id, user_id=user_id)
    db.session.add(comment)
    db.session.commit()

    return jsonify({
        "message": "Comment added successfully",
        "comment_id": comment.id
    }), 201


# GET all Questions by User ID
@question_bp.route('/my-questions', methods=['GET'])
@jwt_required()
def get_my_questions():
    user_id = get_jwt_identity()
    questions = Question.query.filter_by(user_id=user_id).all()
    return jsonify([q.to_dict() for q in questions])



