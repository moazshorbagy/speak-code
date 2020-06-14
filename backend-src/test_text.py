import unittest

from text import encode, decode

class TextTestCase(unittest.TestCase):
    
    def test_encode_decode(self):
        """encode_decode"""
        value = 'some random text'
        self.assertEqual(decode(encode(value)), value)

    def test_encode_input_type(self):
        self.assertRaises(TypeError, encode, 1)
        self.assertRaises(KeyError, encode, 'A')

if __name__ == '__main__':
   unittest.main()
