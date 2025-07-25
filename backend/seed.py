from werkzeug.security import generate_password_hash
from app import create_app, db
from app.models import Question, User, Topic  # Make sure Topic is imported

app = create_app()

with app.app_context():
    db.drop_all()
    db.create_all()

    # Seed user
    user = User.query.first()
    if not user:
        hashed_password = generate_password_hash('password')
        user = User(username='testuser', email='test@example.com', password_hash=hashed_password)
        db.session.add(user)
        db.session.commit()

    
    topic_names = [
        "JavaScript", "React", "Node.js", "Express.js", "MongoDB",
        "HTML", "CSS", "Python", "Flask", "Django",
        "SQL", "PostgreSQL", "TypeScript", "Redux", "API"
    ]
    topics = [Topic(name=name) for name in topic_names]
    db.session.add_all(topics)
    db.session.commit()

    # Map topic names to topic objects for easy lookup
    topic_dict = {topic.name.lower(): topic for topic in topics}

    # Define questions
    questions_data = [
        {"title": "How to center a div in CSS?", "content": "I've tried margin auto, but it doesn't work. Can anyone suggest an alternative solution?"},
        {"title": "What is the difference between let and const in JavaScript?", "content": "I understand var, but I’m not sure how let and const differ in terms of scoping and usage."},
        {"title": "How do I make an API call in React?", "content": "I'm using Axios, but the data isn’t being fetched as expected. How can I troubleshoot this?"},
        {"title": "What are React hooks and how do they work?", "content": "I’m familiar with classes in React, but how do hooks compare and when should they be used?"},
        {"title": "How to manage state in React?", "content": "I’m having trouble managing state in larger React applications. What’s the best approach?"}
    ]

    # Helper to determine which topics to link based on title keywords
    def get_topics_for_question(title):
        title_lower = title.lower()
        matched_topics = []

        for key in topic_dict:
            if key in title_lower:
                matched_topics.append(topic_dict[key])
        return matched_topics

    # Create and link questions to topics
    for q_data in questions_data:
        question = Question(
            title=q_data['title'],
            content=q_data['content'],
            user_id=user.id
        )
        question_topics = get_topics_for_question(q_data['title'])
        question.topics.extend(question_topics)
        db.session.add(question)

    db.session.commit()

    print("Database seeded with user, topics, and questions linked to topics.")
