import re

with open("app.py", "r") as f:
    content = f.read()

# Fix f-string syntax error
content = content.replace('f\\"""', 'f"""')

with open("app.py", "w") as f:
    f.write(content)
