from . import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    # Relationships
    questions = db.relationship('Question', back_populates='user')
    saved_questions = db.relationship('Save', back_populates='user',  cascade='all, delete-orphan')
    comments = db.relationship('Comment', back_populates='user')
    

    def __repr__(self):
       return f"<User id={self.id} username='{self.username}'>"


class Question(db.Model):
    __tablename__ = 'questions'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(128), nullable=False)
    content = db.Column(db.String(1024), nullable=False)

    # Relationships
    comments = db.relationship('Comment', back_populates='question',cascade='all, delete-orphan',
        passive_deletes=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user = db.relationship('User', back_populates='questions')

    saved_by = db.relationship('Save', back_populates='question',  cascade='all, delete-orphan')
    topics = db.relationship('Topic', secondary='question_topics', back_populates='questions')
    
    def to_dict(self, include_comments=False, include_topics=False):
        data = {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "user_id": self.user_id
        }

        if include_comments:
            comments_list = [comment.to_dict() for comment in self.comments]
            data["comments"] = comments_list

        if include_topics:
            data["topics"] = [{"id": t.id, "name": t.name} for t in self.topics]    

        return data
    

    def __repr__(self):
       return f"<Question id={self.id} title='{self.title}'>"


class Save(db.Model):
    __tablename__ = 'saves'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)

    # Relationships
    user = db.relationship('User', back_populates='saved_questions')
    question = db.relationship('Question', back_populates='saved_by')
    
    def __repr__(self):
        return f"<Save user_id={self.user_id} question_id={self.question_id}>"

class Comment(db.Model):
    __tablename__ = 'comments'

    id = db.Column(db.Integer, primary_key=True)
    body = db.Column(db.Text, nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id', name='fk_comments_question_id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Relationships
    question = db.relationship('Question', back_populates='comments')
    user = db.relationship('User', back_populates='comments')

    def to_dict(self):
        return {
            "id": self.id,
            "body": self.body,
            "question_id": self.question_id,
            "user_id": self.user_id
        }



class Topic(db.Model):
    __tablename__ = 'topics'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)

    questions = db.relationship('Question', secondary='question_topics', back_populates='topics')

    def __repr__(self):
        return f'<Topic {self.name}>'


class QuestionTopics(db.Model):
    __tablename__ = 'question_topics'

    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), primary_key=True)
    topic_id = db.Column(db.Integer, db.ForeignKey('topics.id'), primary_key=True)
