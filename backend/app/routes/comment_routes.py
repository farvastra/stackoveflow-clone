from flask import Blueprint, request, jsonify
from app import db
from app.models import Comment, Question, User
from flask_jwt_extended import jwt_required, get_jwt_identity

comment_bp = Blueprint('comments', __name__)

# Get Comments for a Question
@comment_bp.route('/<int:question_id>', methods=['GET'])
@jwt_required()
def get_comments(question_id):
    question = Question.query.get(question_id)
    if not question:
        return jsonify({"message": "Question not found"}), 404

    comments = Comment.query.filter_by(question_id=question_id).all()
    comments_list = [{"id": c.id, "body": c.body} for c in comments]

    return jsonify(comments_list), 200

#pdate a comment
@comment_bp.route('/<int:comment_id>', methods=['PUT'])
@jwt_required()
def update_comment(comment_id):
    user_id = int(get_jwt_identity()) 
    comment = Comment.query.get_or_404(comment_id)

    if comment.user_id != user_id:
        return jsonify({"message": "Unauthorized"}), 403

    data = request.get_json()
    comment.body = data.get('body', comment.body)
    db.session.commit()

    return jsonify({"message": "Comment updated successfully"}), 200

#delete a comment
@comment_bp.route('/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    user_id = int(get_jwt_identity()) 
    comment = Comment.query.get_or_404(comment_id)

    if comment.user_id != user_id:
        return jsonify({"message": "Unauthorized"}), 403

    db.session.delete(comment)
    db.session.commit()

    return jsonify({"message": "Comment deleted successfully"}), 200
