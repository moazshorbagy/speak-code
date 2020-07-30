############
# Method 1 #
############

def levenshtein(a, b):
    "Calculates the Levenshtein distance between a and b."
    n, m = len(a), len(b)
    if n > m:
        # Make sure n <= m, to use O(min(n,m)) space
        a, b = b, a
        n, m = m, n

    current = list(range(n+1))
    for i in range(1, m+1):
        previous, current = current, [i]+[0]*n
        for j in range(1, n+1):
            add, delete = previous[j]+1, current[j-1]+1
            change = previous[j-1]
            if a[j-1] != b[i-1]:
                change = change + 1
            current[j] = min(add, delete, change)

    return current[n]

def wer_cer_batch(samples):
    """Calculates WER and CER on a batch of samples

    The WER is defined as the edit/Levenshtein distance on word level divided by
    the amount of words in the original text.
    In case of the original having more words (N) than the result and both
    being totally different (all N words resulting in 1 edit operation each),
    the WER will always be 1 (N / N = 1).
    
    Parameters
    ----------
    samples : tuple
        The batch of actual and predicted sentence pairs. shape=(batch_size, 2).
        Each sample in the batch should be (y_true, y_pred).

    Returns
    -------
    tuple
        wer, cer.

    Raises
    ------
    TypeError
        If shape of input samples does not match (batch_size, 2).
    """

    word_total_distance = 0
    char_total_distance = 0
    words_count = 0
    chars_count = 0
    
    for ground_truth, prediction in samples:
        word_total_distance += levenshtein(ground_truth.split(), prediction.split())
        char_total_distance += levenshtein(ground_truth, prediction)

        words_count += len(ground_truth.split())
        chars_count += len(ground_truth)
    
    wer = word_total_distance / words_count
    wer = min(wer, 1.0)

    cer = char_total_distance / chars_count
    cer = min(cer, 1.0)
    
    return wer, cer


if __name__ == "__main__":

    print(wer_cer_batch([('example one', 'example uno'), ('hello world example one', 'hello example')]))


    ############
    # Method 2 #
    ############

    from jiwer import wer

    error = wer(['example one', 'hello world example one'], ['example uno', 'hello example'])
    print(error)
