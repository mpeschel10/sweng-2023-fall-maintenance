import os, subprocess, signal
import time
import random
import requests

from pathlib import Path

def curl(s):
	return subprocess.check_output(['curl', '-s'] + s.split(' '))


test_file_expected = ''.join(random.choice('qwertyuiopasdfghjklzxcvbnm') for _ in range(100))
test_file_name = 'test_file.txt'
basic_headers = {
	'Host': 'localhost',
	'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0',
	'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
	'Accept-Language': 'en-US,en;q=0.5',
	'Accept-Encoding': 'gzip, deflate, br',
	'Content-Type': 'multipart/form-data;boundary="---------------------------93065062214185709923576377473"',

}

test_file_body = '''-----------------------------93065062214185709923576377473
Content-Disposition: form-data; name="text-test"


-----------------------------93065062214185709923576377473
Content-Disposition: form-data; name="file"; filename="%s"
Content-Type: text/plain

%s
-----------------------------93065062214185709923576377473--'''
test_file_body = '\r\n'.join(test_file_body.splitlines())
test_file_body = test_file_body % (test_file_name, test_file_expected)
test_file_body_length = len(test_file_body)
test_file_headers = dict(basic_headers)
test_file_headers['Content-Length'] = str(test_file_body_length)

def test_upload_file():
	script_dir = Path(__file__).resolve().parent
	uploads_dir = script_dir.joinpath('www', 'uploads')
	test_file_path = uploads_dir.joinpath(test_file_name)
	test_file_path.unlink(missing_ok=True)

	result = requests.post('http://localhost/image', headers=test_file_headers, data=test_file_body.encode('ASCII'))
	
	try:
		with test_file_path.open() as test_file:
			observed = test_file.read()
	except FileNotFoundError as f:
		observed = b''
	test_file_path.unlink(missing_ok=True)

	return observed
	

tests = [
	("curl('localhost/request')", b'[{"id":1,"tenant":1,"apartment":"255a","location":"Kitchen ceiling","description":"Ugly stain","datetime":1699825975,"photo":"/uploads/kitchen.png","status":"RECEIVED"},{"id":2,"tenant":1,"apartment":"12j","location":"Sitting room","description":"Curtains really need to be cleaned","datetime":1699919329,"photo":"/uploads/shades.png","status":"IN PROGRESS"},{"id":3,"tenant":1,"apartment":"469","location":"Sidewalk","description":"Needs edging","datetime":1699919420,"photo":"/uploads/sidewalk_needs_edging.png","status":"FINISHED"},{"id":4,"tenant":1,"apartment":"West building","location":"Bathroom/living room","description":"Hot water tap not working","datetime":1699919426,"photo":"/uploads/hot_tap_not_working.png","status":"RECEIVED"}]'),
	("curl('localhost/user')", b'[{"id":1,"username":"mpeschel10","password":"password","kind":"MANAGER"},{"id":2,"username":"jcarson99","password":"password","kind":"MAINTENANCE"},{"id":3,"username":"tlindsay4421","password":"password","kind":"TENANT"},{"id":4,"username":"gmarx303","password":"password","kind":"TENANT"},{"id":5,"username":"znewman01","password":"password","kind":"TENANT"}]'),
	("test_upload_file()", test_file_expected)
]

def main():
	for i, (observed_str, expected) in enumerate(tests):
		try:
			observed = eval(observed_str)
			if observed != expected:
				print('Failure on Test', i, ': Expected', expected, 'but got', repr(observed))
			else:
				print('Test', i, 'ok')
		except BaseException as e:
			print('Failure on Test', i, ': Expected', expected, 'but got Exception:', e)


if __name__ == '__main__':
	p = subprocess.Popen(['sh', 'start.sh'])
	time.sleep(1)
	try:
		main()
	except BaseException as e:
		print(e)
	finally:
		os.killpg(os.getpgid(p.pid), signal.SIGTERM)
