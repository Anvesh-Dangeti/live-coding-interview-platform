# executor/run.py
try:
    user_code = open("code.py").read()
    exec_globals = {}

    # Read from stdin
    import sys
    input_data = sys.stdin.read().splitlines()

    # Replace input() to simulate test input line by line
    input_iterator = iter(input_data)
    __builtins__.input = lambda: next(input_iterator)

    exec(user_code, exec_globals)
except Exception as e:
    print("Error:", e)
