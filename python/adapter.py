from flask import Flask, request, jsonify
from script import compare_formulas, compare_with_list
import logging

app = Flask(__name__)

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s %(levelname)s: %(message)s')

@app.route('/compare', methods=['POST'])
def compare():
    data = request.get_json()
    if not data or 'formula1' not in data or 'formula2' not in data:
        return jsonify({'error': 'Invalid input, expected formula1 and formula2'}), 400

    formula1 = data['formula1']
    formula2 = data['formula2']

    try:
        logging.debug(f"Comparing: {formula1} vs {formula2}")
        score, highlighted_1, highlighted_2 = compare_formulas(formula1, formula2)
        return jsonify({
            'score': score,
            'formula1': highlighted_1,
            'formula2': highlighted_2
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/compare-with-db', methods=['POST'])
def compare_with_db():
    data = request.get_json()
    if not data or 'formula' not in data or 'formuladb' not in data:
        return jsonify({'error': 'Invalid input, expected formula and formuladb'}), 400

    formula = data['formula']
    formuladb = data['formuladb']

    try:
        logging.debug(f"Comparing {formula} with DB: {formuladb}")
        top5 = compare_with_list(formula, formuladb)
        return jsonify({
            'top5': [{'formula': pair[0], 'score': pair[1]} for pair in top5]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
