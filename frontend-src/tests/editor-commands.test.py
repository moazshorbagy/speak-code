
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
            'open file expected python', 'go line three go column one', 'variable my variable camel to be one', 'save',
        ]
        testVectorPart2 = [
            'undo', 'save', 'select all', 'copy', 'open file file python', 'paste', 'save', 'close close'
        ]

        client.sendData('start listening')

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
            3. expand folder.
            4. unfocus directory.
            5. open file.
            6. comment line.
            7. save file.
            8. delete line.
            9. save file

        This scenario tests correct operation for editor commands:
            focus-folder
            expand-folder
            collapse-folder
            open-file
            unfocus-folder
            comment-line
            delete-line
        """
        # step 1: set current working directory
        scenario_dir = setWorkingDirectory('scenario2')

        part1 = ['expand folder sub dir one', 'focus folder sub dir one', 'expand folder sub dir two', 'open file use me dashed python',
        'comment line', 'save']

        client.sendData('start listening')

        initial_file_content = getFileContentAsLines(os.path.join(scenario_dir, 'subdir1', 'use-me.py'))

        sendTestVector(part1)

        current_file_content = getFileContentAsLines(os.path.join(scenario_dir, 'subdir1', 'use-me.py'))
        self.assertEqual('# ' + initial_file_content[0], current_file_content[0])

        part2 = ['delete line', 'save', 'unfocus folder', 'collapse folder sub dir one']

        sendTestVector(part2)

        current_file_content = getFileContentAsLines(os.path.join(scenario_dir, 'subdir1', 'use-me.py'))

        self.assertEqual(len(current_file_content), 0)

        client.sendData('undo undo save close')


    def test_scenario3(self):
        """
        This scenario simulates the following user flow:
            1. open directory.
            2. open file.
            3. open another file.
            3. go to next tab (first opened file).
            4. select line 1.
            5. copy.
            6. backspace.
            7. save.
            8. backspace.
            8. go to tab 1.
            9. insert enter and indent then paste then save.
            10. undo twice then save then close tab 1 then save.
            11. (tab 0 is now the focused tab) redo then save.
            12. undo then save then close.

        This scenario tests correct operation for editor commands:
            next-tab
            go-tab
            redo
            backspace
        """
        
        # step 1: set current working directory
        scenario_dir = setWorkingDirectory('scenario3')

        test_file1_path = os.path.join(scenario_dir, 'file1.py')
        test_file2_path = os.path.join(scenario_dir, 'file2.py')

        # opened in tab 0
        file1_original_content = getFileContentAsLines(test_file1_path)
        # opened in tab 1
        file2_original_content = getFileContentAsLines(test_file2_path)

        file2_line1_expected_content = ' ' * 4 + 'max_val = - 1\n'

        part1 = ['open file file one python', 'open file file two python', 'next tab', 'select line', 'copy',
         'move right', 'back space', 'save', 'go tab one', 'enter', 'indent', 'paste', 'save']
        part2 = ['undo undo', 'save', 'close', 'undo', 'save']
        part3 = ['redo', 'save']
        cleanUp = ['undo', 'save', 'close']

        client.sendData('start listening')

        sendTestVector(part1)
        time.sleep(1)
        file1_part1_content = getFileContentAsLines(test_file1_path)
        file2_part1_content = getFileContentAsLines(test_file2_path)

        # effect of backspace: remove only one character
        self.assertEqual(file1_original_content[0], file1_part1_content[0] + file1_original_content[0][-1])
        self.assertEqual(file2_part1_content[1], file2_line1_expected_content)

        sendTestVector(part2)

        file1_part2_content = getFileContentAsLines(test_file1_path)
        self.assertEqual(file1_part2_content[0], file1_original_content[0])

        sendTestVector(part3)

        file1_part3_content = getFileContentAsLines(test_file1_path)

        self.assertEqual(file1_part1_content[0], file1_part3_content[0])

        sendTestVector(cleanUp)


    def test_scenario4(self):
        """
        This scenario simulates the following user flow:
            2. open file.
            3. select all text.
            4. cut file content.
            5. save current file.
            6. open other file.
            7. paste content.

        This scenario tests correct operation for editor commands:
            cut
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

        client.sendData('start listening')

        setWorkingDirectory('scenario4')

        # SETUP PART: prepare input vector
        # TODO: open file should set cursor at line 1 column 1 or at the end of file when the file is opened 
        inputVector = ['open file actual python', 'go line one go column one', 'variable my variable camel to be one', 'save close']
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



    def test_scenario5(self):
        """
        This scenario simulates the following user flow:
            1. open directory.
            2. open file.
            3. perform a series of copy and paste operations using the following commands:
                move-left, move-right, select-up, select-down, select-left, select-right 

        This scenario tests correct operation for editor commands:
            move-right
            move-left
            select-up
            select-down
            select-left
            select-right
            delete-left/delete-right (both are the same but in opposite directions)
            delete-selection
        """   

        scenario_dir = setWorkingDirectory('scenario5')
        expected_file_path = os.path.join(scenario_dir, 'expected.py')
        actual_file_path = os.path.join(scenario_dir, 'actual.py')

        client.sendData('start listening')

        expected_file_content = getFileContentAsLines(expected_file_path)
        num_lines = len(expected_file_content)
        line1_length = len(expected_file_content[0])
        testVector = ['open file expected python', 'open file actual python',
        'next tab', f'go line 1 go column {line1_length - 1}', 'move right', 'select left five zero', 'copy', 
        'next tab', 'paste', 'enter', 
        'next tab', 'go line 2 go column 2', 'move left', 'select right two zero', 'copy',
        'next tab', 'paste', 'enter', 'delete left',
        'next tab', 'go line 3', 'select down two', 'copy',
        'next tab', 'paste', 'enter', 'select left one zero', 'back space',
        'next tab', 'go line 6', 'select up 2', 'copy',
        'next tab', 'paste', 'save',
        'close', 'close']
    
        sendTestVector(testVector)

        actual_file_content = getFileContentAsLines(actual_file_path)

        self.assertEqual(len(actual_file_content), len(expected_file_content))

        for i in range(len(actual_file_content)):
            self.assertEqual(actual_file_content[i], expected_file_content[i])

        deleteFileContent(actual_file_path)

    
    def test_scenario6(self):
        """
        This scenario simulates the following user flow:
            1. open directory.
            2. open file.
            3. perform a series of copy and paste operations using the following commands:
                move-left, move-right, select-up, select-down, select-left, select-right 

        This scenario tests correct operation for editor commands:
            start-listening
            stop-listening
            strange
        """  

        scenario_dir = setWorkingDirectory('scenario6')        
        expected_file_path = os.path.join(scenario_dir, 'expected.py')
        actual_file_path = os.path.join(scenario_dir, 'actual.py')

        expected_file_content = getFileContentAsLines(expected_file_path)
        num_lines = len(expected_file_content)

        testVector = ['start listening', 'open file expected python', 'open file actual python', 
        'next tab stop listening', 'delete line',
        'save', 'close', 'start listening', 'select all', 'copy', 'next tab', 'paste save close close']

        sendTestVector(testVector)

        actual_file_content = getFileContentAsLines(actual_file_path)

        self.assertEqual(len(actual_file_content), len(expected_file_content))

        for i in range(len(actual_file_content)):
            self.assertEqual(actual_file_content[i], expected_file_content[i])

        deleteFileContent(actual_file_path)


if __name__ == '__main__':
    # unittest.main()
    time.sleep(2)
    sendTestVector([
    'start listening',
    'open file file one javascript',
    'go line five',
    'select line copy',
    'open file file three javascript',
    'select line paste',
    'new file my file pascal javascript',
    'variable max count camel to be one zero zero enter',
    'function add brackets',
    'first comma second new scope',
    'return first plus second',
    'exit scope',
    'add brackets one comma two enter',
    'for loop variable max count camel',
    'go tab zero',
    'expand folder folder one',
    'focus folder folder one',
    'open file expected python',
    'for loop one three',
    'print quote hello space world',
    'exit scope stop listening',
    ])
