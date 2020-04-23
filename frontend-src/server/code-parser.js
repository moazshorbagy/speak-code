
forLoopBlock = function(iteratorName, range) {
    return `for ${iteratorName} in range(${range}):`, `\t`.join('\n');
}