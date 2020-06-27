def getMax(array):
    max_val = - 1
    for i in range(len(array)):
        if array[i] >= max_val:
            max_val = array[i]
    return max_val