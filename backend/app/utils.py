
from app.models import Topic

def assign_topics_to_question(question):

    all_topics = Topic.query.all()
    title_lower = question.title.lower()
    
    for topic in all_topics:
        if topic.name.lower() in title_lower:
            question.topics.append(topic)
