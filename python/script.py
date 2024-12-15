import re
from sympy.parsing.latex import parse_latex
from sympy import simplify, expand, SympifyError, latex
from functools import lru_cache

def clean_latex_string(latex_str: str) -> str:
    cleaned = latex_str.replace('{', '').replace('}', '')
    cleaned = re.sub(r'\\', '', cleaned)
    cleaned = cleaned.strip()
    cleaned = re.sub(r'\s+', '', cleaned)
    return cleaned

def parse_formula(latex_str: str):
    try:
        expr = parse_latex(latex_str)
    except (Exception, SympifyError) as e:
        raise ValueError(f"Ошибка парсинга LaTeX: {e}")
    return expr

def try_transformations(expr1, expr2):
    transformations = [
        ("original", lambda e: e),
        ("simplified", simplify),
        ("expanded", expand)
    ]

    best_similarity = -1
    best_pair = (None, None, None, None, None)
    for name1, t1 in transformations:
        for name2, t2 in transformations:
            transformed_expr1 = t1(expr1)
            transformed_expr2 = t2(expr2)
            diff = simplify(transformed_expr1 - transformed_expr2)
            if diff == 0:
                similarity = 100.0
            else:
                str1 = expr_to_string(transformed_expr1)
                str2 = expr_to_string(transformed_expr2)
                seq1 = tokenize(str1)
                seq2 = tokenize(str2)
                similarity = calc_similarity(seq1, seq2)

            if similarity > best_similarity:
                best_similarity = similarity
                best_pair = (best_similarity, transformed_expr1, transformed_expr2, name1, name2)
    return best_pair

def expr_to_string(expr):
    s = str(expr)
    s = s.replace('*', '')
    return s

def tokenize(formula_str):
    tokens = re.findall(r'[()+\-^]|[0-9]+|[a-zA-Z]+[0-9]*|[0-9]+[a-zA-Z]+', formula_str)
    final_tokens = []
    for t in tokens:
        if '^' in t and t != '^':
            parts = t.split('^')
            final_tokens.append(parts[0])
            final_tokens.append('^')
            final_tokens.append(parts[1])
        else:
            if re.match(r'^[0-9]+[a-zA-Z]+$', t):
                m = re.match(r'^([0-9]+)([a-zA-Z]+)$', t)
                if m:
                    final_tokens.append(m.group(1))
                    final_tokens.append(m.group(2))
            else:
                final_tokens.append(t)
    return final_tokens

@lru_cache(None)
def lcs_length(seq1, seq2):
    @lru_cache(None)
    def lcs(i, j):
        if i == len(seq1) or j == len(seq2):
            return 0
        if seq1[i] == seq2[j]:
            return 1 + lcs(i+1, j+1)
        else:
            return max(lcs(i+1, j), lcs(i, j+1))
    return lcs(0, 0)

def reconstruct_lcs(seq1, seq2):
    l1, l2 = len(seq1), len(seq2)
    dp = [[0]*(l2+1) for _ in range(l1+1)]
    for i in range(l1):
        for j in range(l2):
            if seq1[i] == seq2[j]:
                dp[i+1][j+1] = dp[i][j] + 1
            else:
                dp[i+1][j+1] = max(dp[i+1][j], dp[i][j+1])
    i, j = l1, l2
    lcs_res = []
    while i > 0 and j > 0:
        if seq1[i-1] == seq2[j-1]:
            lcs_res.append(seq1[i-1])
            i -= 1
            j -= 1
        else:
            if dp[i-1][j] > dp[i][j-1]:
                i -= 1
            else:
                j -= 1
    lcs_res.reverse()
    return lcs_res

def calc_similarity(seq1, seq2):
    l = lcs_length(tuple(seq1), tuple(seq2))
    if (len(seq1)+len(seq2)) > 0:
        return (2 * l / (len(seq1) + len(seq2))) * 100
    return 0.0

def tokenize_latex(latex_str):
    pattern = r'(\\[a-zA-Z]+)|(\d+)|([a-zA-Z])|([\^\+\-\(\)\{\}])'
    tokens_raw = re.findall(pattern, latex_str)
    tokens = []
    for group in tokens_raw:
        for g in group:
            if g:
                tokens.append(g)
    return tokens



def highlight_differences_in_latex(latex_str_1, latex_str_2):
    seq1 = tokenize_latex(latex_str_1)
    seq2 = tokenize_latex(latex_str_2)
    lcs_res = reconstruct_lcs(seq1, seq2)
    lcs_set = set(lcs_res)
    new_seq1 = [f";{t};" if t not in lcs_set else t for t in seq1]
    new_seq2 = [f";{t};" if t not in lcs_set else t for t in seq2]
    highlighted_1 = ''.join(new_seq1)
    highlighted_2 = ''.join(new_seq2)
    return highlighted_1, highlighted_2

def compare_formulas(latex_str_1: str, latex_str_2: str):
    expr1 = parse_formula(latex_str_1)
    expr2 = parse_formula(latex_str_2)

    best_similarity, best_expr1, best_expr2, transf1, transf2 = try_transformations(expr1, expr2)

    # Используем mul_symbol='\\cdot' чтобы явно отображать умножение
    latex_expr1 = latex(best_expr1, mul_symbol='\\cdot')
    latex_expr2 = latex(best_expr2, mul_symbol='\\cdot')

    # Удаляем \left и \right
    latex_expr1 = latex_expr1.replace('\\left','').replace('\\right','')
    latex_expr2 = latex_expr2.replace('\\left','').replace('\\right','')

    if best_similarity == 100.0:
        return best_similarity, latex_expr1, latex_expr2

    highlighted_1, highlighted_2 = highlight_differences_in_latex(latex_expr1, latex_expr2)
    return best_similarity, highlighted_1, highlighted_2

def compare_with_list(formula, list_of_fs):
    top5 = []
    percents = {}
    for i in range(len(list_of_fs)):
        percents[i] = compare_formulas(formula, list_of_fs[i])[0]
    percents_sorted = dict(sorted(percents.items(), key=lambda item: item[1], reverse=True))
    keys_list = list(percents_sorted.keys())
    for i in range(min(5, len(keys_list))):
        index = keys_list[i]
        top5.append((list_of_fs[index], percents_sorted[index]))
    return top5


if __name__ == "__main__":
    formulas = [
        (r"(x+1)^{2}", r"x^{2} + 2*x"),
        ("\\sin(x) + \cos(x)", "\\sin(x) - \cos(x)"),
        (r"e^{x} + e^{-x}", r"e^{x} - e^{-x}"),
        (r"\log(2*x)", r"\log(x) + \log(2)"),
        (r"\frac{1}{x} + \frac{1}{y}", r"\frac{1}{x+y}"),
        (r"\tan(x)", r"\cot(x)"),
        (r"\sqrt{x^{2} + 1}", r"x + 1"),
        (r"\sqrt{x}", r"\sqrt[2]{x}"),
        (r"\sin^{2}(x)", r"1 - \sin^{2}(x)"),
        (r"x^{3} + 2*x^{2} + x", r"x^{3} + x^{2} + x"),
    ]

    polynomials = ['l \\times w', '0.5 \\times b \\times h', '\\pi r^2', '2 \\pi r', '2(l + w)', 'a^2 + b^2', '\\frac{4}{3} \\pi r^3', '\\pi r^2 h', '\\frac{1}{3} \\pi r^2 h', 'l w h', '\\frac{y_2 - y_1}{x_2 - x_1}', '\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', '\\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}', '\\left(\\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2}\\right)', 'P r t', 'P(1 + \\frac{r}{n})^{nt}', '\\frac{m}{V}', '\\frac{d}{t}', 'm a', 'F d \\cos(\\theta)', '\\frac{W}{t}', '0.5 m v^2', 'm g h', 'I R', '\\frac{nRT}{P}', 'e^{i\\theta} = \\cos(\\theta) + i \\sin(\\theta)', '\\frac{n}{2}(a_1 + a_n)', 'a_1 \\frac{1 - r^n}{1 - r}', '0.5 (a+b) h']


    for f1, f2 in formulas:
        result = compare_formulas(f1, f2)
        print(f"Вход: {f1} и {f2}\nВыход: {result}\n")

    check = r"2*x^{2} + x - 3"

    print(compare_with_list(check, polynomials))