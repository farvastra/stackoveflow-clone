from flask import Blueprint, request, jsonify
from app import db
from app.models import Save, Question
from flask_jwt_extended import jwt_required, get_jwt_identity

save_bp = Blueprint('save', __name__)

# Save a Question
@save_bp.route('/save-q', methods=['POST'])
@jwt_required()
def save_question():
    data = request.get_json()
    question_id = data.get('question_id')
    user_id = get_jwt_identity()

    if not question_id:
        return jsonify({"message": "Question ID is required"}), 400

    question = Question.query.get_or_404(question_id)

    # Prevent duplicate saves
    existing = Save.query.filter_by(user_id=user_id, question_id=question_id).first()
    if existing:
        return jsonify({"message": "Question already saved"}), 400

    new_save = Save(user_id=user_id, question_id=question_id)
    db.session.add(new_save)
    db.session.commit()

    return jsonify({"message": "Question saved successfully"}), 201


# Unsave a Question
@save_bp.route('/unsave', methods=['DELETE'])
@jwt_required()
def unsave_question():
    data = request.get_json()
    question_id = data.get('question_id')
    user_id = get_jwt_identity()

    if not question_id:
        return jsonify({"message": "Question ID is required"}), 400

    save_entry = Save.query.filter_by(user_id=user_id, question_id=question_id).first()
    if not save_entry:
        return jsonify({"message": "Save entry not found, try again"}), 404

    db.session.delete(save_entry)
    db.session.commit()

    return jsonify({"message": "Question unsaved successfully"}), 200


# Get All Saved Questions for a User
@save_bp.route('/all', methods=['GET'])
@jwt_required()
def get_saved_questions():
    user_id = get_jwt_identity()
    saved_questions = Save.query.filter_by(user_id=user_id).all()
    saved_list = [{"id": sq.question.id, "title": sq.question.title} for sq in saved_questions]

    return jsonify(saved_list), 200
