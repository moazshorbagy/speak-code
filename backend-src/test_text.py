import unittest

from text import encode, decode

class TextTestCase(unittest.TestCase):
    
    def test_encode_decode(self):
        """Decode is inverse of Encode"""
        
        value = 'some random text'
        expectedOutput = value

        actualOutput = decode(encode(value))

        self.assertEqual(actualOutput, expectedOutput, 'Decode is not the inverse of Encode')

    def test_encode_input_type(self):
        """Correct raising of type error"""
        self.assertRaises(TypeError, encode, 1)
        self.assertRaises(KeyError, encode, 'A')
    
    def test_decode_input_type(self):
        """Correct raising of type error"""
        self.assertRaises(TypeError, decode, 1)
        self.assertRaises(TypeError, decode, 'A')

if __name__ == '__main__':
   unittest.main()
