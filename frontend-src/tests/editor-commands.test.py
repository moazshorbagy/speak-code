
# must be in the same directory for the script to run correctly
import unittest
import zerorpc
import time

client = zerorpc.Client(heartbeat=30000, timeout=32000)
client.connect("tcp://127.0.0.1:4242")

import os
import os.path as path

# direct editor commands
directCommands = {
    "change-folder": "change-directory",
    "save": "save-file",
    "zoom-in": "zoom-in",
    "zoom-out": "zoom-out",
    "undo": "undo",
    "redo": "redo",
    "close-tab": "close",
    "next-tab": "next-tab",
    "increment-cursor": "move-right",
    "decrement-cursor": "move-left" ,
    "select-all-text": "select-all",
    "cut": "cut",
    "copy": "copy",
    "paste": "paste",
    "backspace": "backspace",
    "comment-line": "comment-line",
    "delete-line": "delete-line",
    "unfocus-folder": "unfocus-folder"
}

indirectCommands = {
    "open-file-from-directory": "open-file",
    "expand-folder": "expand-folder",
    "navgiate-to-tab": "go-tab",
    "set-cursor-to-line": "go-line",
    "set-cursor-to-column": "go-column",
    "focus-folder": "focus-folder"
}

def sendTestVector(testVector):
    for i in range(len(testVector)):
        client.sendData(testVector[i])
        time.sleep(0.5)

def getFileContentAsLines(filePath):
    with open(filePath) as f:
        return f.readlines()

def deleteFileContent(filePath):
    file = open(filePath,"r+")
    file. truncate(0)
    file. close()

class TestScenarios(unittest.TestCase):
    # This scenario simulates the following flow:
    # 1. open directory.
    # 2. open file.
    # 3. insert code.
    # 4. save.
    # 5. undo.
    # 6. save.
    # 7. select all.
    # 8. copy.
    # 9. open other file.
    # 10. paste content from clipboard.
    # 11. save.
    # 12. close current tab.
    def test_scenario1(self):

        test_directory = 'test_directory'

        cwd = os.getcwd()

        testdir = path.join(cwd, test_directory)

        # step 1: sets the working directory via special access
        client.setDirectory(testdir)

        # test vectors are divided into parts to do necessary check after each part
        testVectorPart1 = [
            'open file expected1.py', 'variable my variable camel case to be one', 'save',
        ]
        testVectorPart2 = [
            'undo', 'save', 'select all', 'copy', 'open file file.py', 'paste', 'save', 'close'
        ]

        time.sleep(0.5)

        SourceFilePath = path.join(testdir, 'expected1.py')
        DestinationFilePath = path.join(testdir, 'file.py')

        originalFileLines = getFileContentAsLines(SourceFilePath)

        # steps 2 through 4
        # inserts code into the file 'expected1.py' in the first line
        sendTestVector(testVectorPart1)       

        modifiedFileLines = getFileContentAsLines(SourceFilePath)

        # the line that is expected to be inserted when sending testVectorPart1
        expectedCIResult = 'myVariable = 1' +  originalFileLines[0];

        self.assertEqual(modifiedFileLines[0], expectedCIResult)

        # # steps 5 through 12
        # # copy and paste from 'expected1.py' to 'file.py'
        sendTestVector(testVectorPart2)

        destinationFileLines = getFileContentAsLines(DestinationFilePath)

        length = min(len(destinationFileLines), len(originalFileLines))

        for i in range(length):
            self.assertEqual(destinationFileLines[i], originalFileLines[i])

        deleteFileContent(DestinationFilePath)

        time.sleep(1)

    # This scenario simulates the following user flow:
    # 1. open directory.
    # 2. focus a directory.
    # 3. open file.
    # 4. unfocus directory.
    # 5. open file.
    # 6. delete line.
    # 7. move cursor to specific line.
    # 8. comment line.
    # 9. undo.
    # 10. navigate to next tab.
    def test_scenario2():
        pass


    # This scenario simulates the following user flow:
    # 1. open directory.
    # 2. open file.
    # 3. select all text.
    # 4. cut file content.
    # 5. save current file.
    # 6. open other file.
    # 7. paste content.
    def test_scenario3():
        pass

if __name__ == '__main__':
    unittest.main()