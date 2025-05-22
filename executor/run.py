# executor/run.py

with open("code.py", "r") as f:
    user_code = f.read()

try:
    exec(user_code)
except Exception as e:
    print("Error:", e)
