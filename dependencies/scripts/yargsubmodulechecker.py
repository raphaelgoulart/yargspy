import requests

token = ""
with open("github_token.txt", 'r') as file:
    token = file.read()
url = 'https://api.github.com/repos/YARC-Official/YARG/contents/'
headers = {'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Authorization': 'Bearer' + token}

r = requests.get(url, headers=headers)

json = r.json()
for element in json:
    if element["name"] == "YARG.Core":
        with open("stable.txt", "w") as text_file:
            text_file.write(element["sha"])
        break

#with open("output.json", "w") as text_file:
#    text_file.write(r.text)