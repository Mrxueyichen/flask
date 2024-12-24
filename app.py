from flask import Flask, request, jsonify,render_template
from pymongo import MongoClient
from game.models import players_collection


app = Flask(__name__)
#client = MongoClient('mongodb://localhost:27017/')
#db = client['gamedb']
#players_collection = db['players']
# 设置首页路由
@app.route('/')
def index():
    return render_template('index.html')
#@app.route('/player_info/<player_id>')
#def player_info(player_id):
#    player = players_collection.find_one({'_id': player_id})
#    if player:
#        return jsonify({'name': player['name'], 'score_history': player['score_history']})
#    else:
#        return jsonify({'error': 'Player not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)
