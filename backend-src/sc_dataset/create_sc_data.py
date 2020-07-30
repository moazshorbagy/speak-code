import pandas as pd

def main():
    train = []

    with open('input.txt', 'r') as f:
        lines = f.readlines()

    for line in lines:
        line = line.strip()
        if(line != ""):
            train.append(["", line])

    for i in range(len(train)):
        train[i][0] = f"SC/train/{i}.wav"

    pd.DataFrame(train, columns=['filename', 'text']).to_csv('sc_train.csv', index=False)

if __name__=="__main__":
    main()
