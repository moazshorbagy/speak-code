import pandas as pd
import numpy as np
import constants as c
import re
import json
import os


class LM():
    def __init__(self, cwd, n_gram=None):
        self.n_gram     = n_gram
        self.lm         = None
        self.cwd = cwd

    def generate_lm_from_csv(self,csv_path):
        df          = pd.read_csv(csv_path)
        phrases     = df['text']
        self.lm     = self.generate_char_combination()
        # count the occurance of every n-gram combination from the dataset
        for phrase in phrases:
            if type(phrase)!='str':
                continue

            if phrase[0]==' ':
                phrase=phrase[1:]
            phrase=re.sub('[!\'\"!@#$%^&*()\[\]<>.0-9]',' ',phrase)
            phrase=(c.start_token*(self.n_gram-1))+phrase


            for i in range(0,len(phrase)-self.n_gram):
                substring=phrase[i:i+self.n_gram]
                self.lm[substring]+=1

        # create (n-1)-gram dictionary
        minus_dic   =   {}
        for sub in self.lm:
            if sub[0:-1] in minus_dic:
                minus_dic[sub[0:-1]]+=self.lm[sub]
            else:
                minus_dic[sub[0:-1]]=self.lm[sub]

        # calculate probability for each n-gram combination
        for sub in self.lm:
            self.lm[sub]=self.lm[sub]/(minus_dic[sub[0:-1]])

        lang_model_path = os.path.join(self.cwd, 'language_model.txt')
        print(lang_model_path)
        with open(lang_model_path,'w') as json_file:
            json_file.write(str(self.n_gram)+'\n')
            json.dump(self.lm,json_file)

        return self.lm

    def load_lm(self):
        lang_model_path = os.path.join(self.cwd, 'language_model.txt')
        with open(lang_model_path) as file:
            self.n_gram = int(file.readline().rstrip())
            self.lm     = json.loads(file.read())

    def generate_from_txt(self,text_name):
        self.lm     = self.generate_char_combination()
        with open(text_name) as file:
            s=file.readlines()
        for phrase in s:
            phrase=phrase.rstrip()
            phrase=phrase.lower()
            phrase=re.sub('__label__2 |__label__1 ','',phrase)
            phrase=re.sub('[^a-z\s]','',phrase)
            phrase=(c.start_token*(self.n_gram-1))+phrase


            for i in range(0,len(phrase)-self.n_gram):
                substring=phrase[i:i+self.n_gram]
                self.lm[substring]+=1

        # create (n-1)-gram dictionary
        minus_dic   =   {}
        for sub in self.lm:
            if sub[0:-1] in minus_dic:
                minus_dic[sub[0:-1]]+=self.lm[sub]
            else:
                minus_dic[sub[0:-1]]=self.lm[sub]

        # calculate probability for each n-gram combination
        for sub in self.lm:
            self.lm[sub]=self.lm[sub]/(minus_dic[sub[0:-1]])

        lang_model_path = os.path.join(self.cwd, 'language_model.txt')
        with open(lang_model_path,'w') as json_file:
            json_file.write(str(self.n_gram)+'\n')
            json.dump(self.lm,json_file)

        return self.lm



    def calculate_probability(self,sentence):
        if sentence[-1]!=c.end_token:
            sentence=(c.start_token*(self.n_gram-1))+sentence+(c.end_token*(self.n_gram-1))
        else:
            sentence=(c.start_token*(self.n_gram-1))+sentence+(c.end_token*(self.n_gram-2))
        probability=1
        words=sentence.split(' ')
        for word in words:
            for i in range(0,len(word)-self.n_gram):
                probability*=self.lm[word[i:i+self.n_gram]]

        return probability

    def generate_char_combination(self):
        combinations_1=['']
        alphabet =c.alphabet[1:]
        for _ in range(self.n_gram):
            combinations_2=[]
            while combinations_1:
                element = combinations_1.pop(0)
                for char in alphabet:
                    combinations_2.append(element+char)

            combinations_1=combinations_2

        init_combinations={}
        for combination in combinations_1:
            init_combinations[combination]=1

        return init_combinations
