import unittest

from test_text import TextTestCase
from test_features import FeaturesTestCase

def suite():
    suite = unittest.TestSuite()

    suite.addTest(TextTestCase('test_encode_decode'))
    suite.addTest(TextTestCase('test_encode_input_type'))
    
    suite.addTest(FeaturesTestCase('test_get_features'))
    
    return suite

if __name__ == '__main__':
    runner = unittest.TextTestRunner()
    runner.run(suite())
