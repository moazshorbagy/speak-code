
# must be in the same directory for the script to run correctly
import unittest
import zerorpc
import time

client = zerorpc.Client(heartbeat=30000, timeout=32000)
client.connect("tcp://127.0.0.1:4242")

import os

test_dir = os.path.join(os.getcwd(), 'test_directory')

def sendTestVector(testVector):
    for entry in testVector:
        client.sendData(entry)
        time.sleep(0.5)

def getFileContentAsLines(filePath):
    with open(filePath) as f:
        lines = f.readlines()
    return lines

def deleteFileContent(filePath):
    with open(filePath, "r+") as f:
        f.truncate(0)
        f.close()

def setWorkingDirectory(working_dir):
    """Set the working directory via special access"""
    path = os.path.join(test_dir, working_dir)
    client.setDirectory(path)
    return path

class TestScenarios(unittest.TestCase):
    
    def test_scenario1(self):
        """
        This scenario simulates the following flow:
            1. open directory.
            2. open file.
            3. insert code.
            4. save.
            5. undo.
            6. save.
            7. select all.
            8. copy.
            9. open other file.
            10. paste content from clipboard.
            11. save.
            12. close current tab.

        This scenario tests correct operation for editor commands:
            open-file
            close
            save
            go-line
            go-column
            undo
            select-all
            copy
            paste
        """
        # step 1: set current working directory
        scenario_dir = setWorkingDirectory('scenario1')

        # test vectors are divided into parts to do necessary check after each part
        testVectorPart1 = [
            'open file expected.py', 'go line three go column one', 'variable my variable camel case to be one', 'save',
        ]
        testVectorPart2 = [
            'undo', 'save', 'select all', 'copy', 'open file file.py', 'paste', 'save', 'close close'
        ]

        time.sleep(0.5)

        SourceFilePath = os.path.join(scenario_dir, 'expected.py')
        DestinationFilePath = os.path.join(scenario_dir, 'file.py')

        originalFileLines = getFileContentAsLines(SourceFilePath)

        # steps 2 through 4
        # inserts code into the file 'expected1.py' in the first line
        sendTestVector(testVectorPart1)

        modifiedFileLines = getFileContentAsLines(SourceFilePath)

        # the line that is expected to be inserted when sending testVectorPart1
        expectedCIResult = 'myVariable = 1'

        self.assertEqual(modifiedFileLines[-1], expectedCIResult)

        # # steps 5 through 12
        # # copy and paste from 'expected1.py' to 'file.py'
        sendTestVector(testVectorPart2)

        destinationFileLines = getFileContentAsLines(DestinationFilePath)

        deleteFileContent(DestinationFilePath)
        
        self.assertEqual(destinationFileLines, originalFileLines)

        time.sleep(1)


    def test_scenario2(self):
        """
        This scenario simulates the following user flow:
            1. open directory.
            2. focus a directory.
            3. open file.
            4. unfocus directory.
            5. open file.
            6. delete line.
            7. move cursor to specific line.
            8. comment line.
            9. undo.
            10. navigate to next tab.
        """
        pass


    def test_scenario3(self):
        """
        This scenario simulates the following user flow:
            1. open directory.
            2. open file.
            3. select all text.
            4. cut file content.
            5. save current file.
            6. open other file.
            7. paste content.
        """
        pass



    def test_scenario4(self):
        """
        This scenario simulates the following user flow:
            2. open file.
            3. select all text.
            4. cut file content.
            5. save current file.
            6. open other file.
            7. paste content.
        """
        # PRE-PROCESS: preparing test case
        scenario_dir = os.path.join(test_dir, 'scenario4')
        input_file_path = os.path.join(scenario_dir, 'input.py')
        actual_file_path = os.path.join(scenario_dir, 'actual.py')
        expected_file_path = os.path.join(scenario_dir, 'expected.py')
        
        input_lines = getFileContentAsLines(input_file_path)
        with open(actual_file_path, "w+") as f:
            for line in input_lines:
                f.write(line)

        setWorkingDirectory('scenario4')

        # SETUP PART: prepare input vector
        # TODO: open file should set cursor at line 1 column 1 or at the end of file when the file is opened 
        inputVector = ['open file actual.py', 'go line one go column one', 'variable my variable camel case to be one', 'save close']
        time.sleep(0.5)

        # CALL PART: applies the input vector to the actual output file
        sendTestVector(inputVector)
        time.sleep(1)

        # ASSERTTION PART: asserts that actualOutput and expectedOutput are equal
        actualOutput = getFileContentAsLines(actual_file_path)
        expectedOutput = getFileContentAsLines(expected_file_path)
        self.assertEqual(actualOutput, expectedOutput)
        time.sleep(1)
        
        # POST-PROCESS: delete actual output file
        os.remove(actual_file_path)

if __name__ == '__main__':
    unittest.main()
