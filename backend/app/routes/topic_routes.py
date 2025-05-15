from flask import Blueprint, request, jsonify
from app import db
from app.models import Topic, Question
from flask_jwt_extended import jwt_required, get_jwt_identity

topic_bp = Blueprint('topics', __name__)

# Create a Topic
@topic_bp.route('/add-topic', methods=['POST'])
@jwt_required()
def create_topic():
    data = request.get_json()
    name = data.get('name')

    if not name:
        return jsonify({"message": "Topic name is required"}), 400

    if Topic.query.filter_by(name=name).first():
        return jsonify({"message": "Topic already exists"}), 400

    new_topic = Topic(name=name)
    db.session.add(new_topic)
    db.session.commit()

    return jsonify({"message": "Topic created successfully", "topic_id": new_topic.id}), 201


# Get All Topics
@topic_bp.route('/all-topics', methods=['GET'])
def get_all_topics():
    topics = Topic.query.all()
    topics_list = [{"id": t.id, "name": t.name} for t in topics]
    return jsonify(topics_list), 200


# View Topics on a Question
@topic_bp.route('/<int:question_id>', methods=['GET'])
def get_topics_on_question(question_id):
    question = Question.query.get_or_404(question_id)
    topics = [{"id": t.id, "name": t.name} for t in question.topics]
    return jsonify(topics), 200


# Add topic to question
@topic_bp.route('/<int:question_id>/add', methods=['POST'])
@jwt_required()
def add_topic_to_question(question_id):
    data = request.get_json()
    topic_id = data.get('topic_id')

    if not topic_id:
        return jsonify({"message": "Topic ID is required"}), 400

    question = Question.query.get_or_404(question_id)
    topic = Topic.query.get_or_404(topic_id)

    if topic not in question.topics:
        question.topics.append(topic)
        db.session.commit()

    updated_topics = [{"id": t.id, "name": t.name} for t in question.topics]
    return jsonify({"message": "Topic added", "topics": updated_topics}), 200


# Remove topic from question
@topic_bp.route('/<int:question_id>/remove', methods=['POST'])
@jwt_required()
def remove_topic_from_question(question_id):
    data = request.get_json()
    topic_id = data.get('topic_id')

    if not topic_id:
        return jsonify({"message": "Topic ID is required"}), 400

    question = Question.query.get_or_404(question_id)
    topic = Topic.query.get_or_404(topic_id)

    if topic in question.topics:
        question.topics.remove(topic)
        db.session.commit()

    updated_topics = [{"id": t.id, "name": t.name} for t in question.topics]
    return jsonify({"message": "Topic removed", "topics": updated_topics}), 200


## Get questions by topic
@topic_bp.route('/questions-by-topics', methods=['POST'])
def get_questions_by_topics():
    data = request.get_json()
    topic_ids = data.get('topic_ids', [])

    if not topic_ids:
        return jsonify([]) 

    questions = (
        db.session.query(Question)
        .join(Question.topics)
        .filter(Topic.id.in_(topic_ids))
        .distinct()
        .all()
    )

    return jsonify([q.to_dict() for q in questions])
