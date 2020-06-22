def getMax(array1):
    max_value = - 1
    for i in range(len(array1)):
        if array1[i] >= max_value:
            max_value = array1[i]
        return max_value
    