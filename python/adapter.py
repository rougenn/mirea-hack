from flask import Flask, request, jsonify
from script import compare_formulas

app = Flask(__name__)

@app.route('/compare', methods=['POST'])
def compare():
    data = request.get_json()
    if not data or 'formula1' not in data or 'formula2' not in data:
        return jsonify({'error': 'Invalid input, expected formula1 and formula2'}), 400

    formula1 = data['formula1']
    formula2 = data['formula2']

    try:
        score, highlighted_1, highlighted_2 = compare_formulas(formula1, formula2)
        return jsonify({
            'score': score,
            'formula1': highlighted_1,
            'formula2': highlighted_2
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
