import unittest

import numpy as np

import constants as c
from features import get_features

class FeaturesTestCase(unittest.TestCase):
    
    def test_get_features(self):
        N = 1 # number of seconds
        value = np.zeros(N * c.sample_rate) # mocking the samples of an N second recording
        self.assertEqual(get_features(value).shape[1], c.n_mfcc, 'get_features returns incorrect number of features')
        self.assertAlmostEqual(get_features(value).shape[0], N / (c.frame_duration - c.frame_overlap), 10, 'get_features returns incorrect sequence length')

if __name__ == '__main__':
   unittest.main()
