import re
from collections import Counter
import os


def words(text): return re.findall(r'\w+', text.lower())

dataPath = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'big.txt')
WORDS = dict(Counter(words(open(dataPath).read())))

def P(word, N=sum(WORDS.values())): 
    try:
        "Probability of `word`."
        return WORDS[word] / N
    except:
        return '/'

def correction(word): 
    val = ''
    try:
        "Most probable spelling correction for word."
        val = max(candidates(word), key=P)
    except:
        val = ''
    return val

def candidates(word): 
    "Generate possible spelling corrections for word."
    return set(known([word]))

def known(words): 
    "The subset of `words` that appear in the dictionary of WORDS."
    return [w for w in words if w in WORDS]

def edits1(word):
    "All edits that are one edit away from `word`."
    letters    = 'abcdefghijklmnopqrstuvwxyz'
    splits     = [(word[:i], word[i:])    for i in range(len(word) + 1)]
    deletes    = [L + R[1:]               for L, R in splits if R]
    transposes = [L + R[1] + R[0] + R[2:] for L, R in splits if len(R)>1]
    replaces   = [L + c + R[1:]           for L, R in splits if R for c in letters]
    inserts    = [L + c + R               for L, R in splits for c in letters]
    return set(deletes + transposes + replaces + inserts)

def edits2(word): 
    "All edits that are two edits away from `word`."
    return (e2 for e1 in edits1(word) for e2 in edits1(e1))