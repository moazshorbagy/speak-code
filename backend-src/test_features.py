import unittest

import numpy as np

import constants as c
from features import get_features

class FeaturesTestCase(unittest.TestCase):
    
    def test_get_features_1(self):
        """Correct number of features"""

        N = 1 # number of seconds
        value = np.zeros(N * c.sample_rate) # mocking the samples of an N second recording
        expected_output = c.n_mfcc

        actualOutput = get_features(value).shape[1]

        self.assertEqual(actualOutput, expected_output, 'get_features returns incorrect number of features')
        
    def test_get_features_2(self):
        """Correct sequence length calculation"""

        N = 1 # number of seconds
        value = np.zeros(N * c.sample_rate) # mocking the samples of an N second recording
        expected_output = N / (c.frame_duration - c.frame_overlap)
        
        actualOutput = get_features(value).shape[0]

        self.assertAlmostEqual(actualOutput, expected_output, 10, 'get_features returns incorrect sequence length')
    
    def test_get_features_input_type(self):
        """Correct raising of type error"""
        self.assertRaises(TypeError, get_features, 1)
        self.assertRaises(TypeError, get_features, 'A')

if __name__ == '__main__':
   unittest.main()
