import os, subprocess, signal
import time
import random
import requests

from pathlib import Path

def curl(s):
	return subprocess.check_output(['curl', '-s'] + s.split(' '))

boundary_start = '-' * 25
def random_boundary():
	return boundary_start + ''.join(random.choices('0123456789', k=29))

def random_name():
	def c(): return random.choice('qwrtypsdfghjklzxcvnm')
	def v(): return random.choice('aeiouy')
	return c() + v() + c() + v() + v() + c()

basic_headers = {
	'Host': 'localhost',
	'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0',
	'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
	'Accept-Language': 'en-US,en;q=0.5',
	'Accept-Encoding': 'gzip, deflate, br',
}

test_upload_file_expected = ''.join(random.choices('abcdefghijklmnopqrstuvwxyz', k=100))
def make_test_upload_file_headers_body(name):
	boundary = random_boundary()

	body = '''--{}
Content-Disposition: form-data; name="text-test"


--{}
Content-Disposition: form-data; name="file"; filename="%s"
Content-Type: text/plain

%s
--{}--'''.format(boundary, boundary, boundary)
	
	body = '\r\n'.join(body.splitlines())
	body = body % (name, test_upload_file_expected)
	body_length = len(body)
	headers = dict(basic_headers)
	headers['Content-Type'] = 'multipart/form-data;boundary="%s"' % boundary
	headers['Content-Length'] = str(body_length)
	return headers, body

def test_upload_file():
	name = 'test_file.txt'
	script_dir = Path(__file__).resolve().parent
	uploads_dir = script_dir.joinpath('www', 'uploads')
	path = uploads_dir.joinpath(name)
	path.unlink(missing_ok=True)

	headers, body = make_test_upload_file_headers_body(name)
	result = requests.post('http://localhost/image', headers=headers, data=body.encode('ASCII'))
	# The server responds as soon as multer is done parsing the form,
	#  but writes to files are placed in a queue.
	# Wait so the queue will hopefully be flushed by the time we read the file.
	time.sleep(0.1)
	# print(result.status_code)
	# print(result.content)
	
	try:
		with path.open() as file:
			observed = file.read()
	except FileNotFoundError as f:
		observed = b''
	path.unlink(missing_ok=True)

	return observed

test_post_user_expected = [{
	"id":6,
	"username":random_name(),
	"password":"password",
	"kind":random.choice(('TENANT', 'MAINTENANCE', 'MANAGER')),
}]

def test_post_user():
	u ,= test_post_user_expected
	params = {
		'username': u['username'],
		'password': u['password'],
		'kind': u['kind'],
	}
	result = requests.post('http://localhost/user', params=params, headers=basic_headers)
	# print(result.status_code)
	insertId = result.json()

	params = {
		'id': insertId
	}
	result = requests.get('http://localhost/user', params=params, headers=basic_headers)
	# print(result.status_code)
	# print(result.content)
	# print(result.json())
	return result.json()

tests = {
	'get request' : ("curl('localhost/request')", b'[{"id":1,"tenant":1,"apartment":"255a","location":"Kitchen ceiling","description":"Ugly stain","datetime":1699825975,"photo":"/uploads/kitchen.png","status":"RECEIVED"},{"id":2,"tenant":1,"apartment":"12j","location":"Sitting room","description":"Curtains really need to be cleaned","datetime":1699919329,"photo":"/uploads/shades.png","status":"IN PROGRESS"},{"id":3,"tenant":1,"apartment":"469","location":"Sidewalk","description":"Needs edging","datetime":1699919420,"photo":"/uploads/sidewalk_needs_edging.png","status":"FINISHED"},{"id":4,"tenant":1,"apartment":"West building","location":"Bathroom/living room","description":"Hot water tap not working","datetime":1699919426,"photo":"/uploads/hot_tap_not_working.png","status":"RECEIVED"}]'),
	'get user' : ("curl('localhost/user')", b'[{"id":1,"username":"mpeschel10","password":"password","kind":"MANAGER"},{"id":2,"username":"jcarson99","password":"password","kind":"MAINTENANCE"},{"id":3,"username":"tlindsay4421","password":"password","kind":"TENANT"},{"id":4,"username":"gmarx303","password":"password","kind":"TENANT"},{"id":5,"username":"znewman01","password":"password","kind":"TENANT"}]'),
	'upload file': ["test_upload_file()", test_upload_file_expected],
	'post user': ("test_post_user()", test_post_user_expected),
}

def main():
	for i, key in enumerate(tests):
		(observed_str, expected) = tests[key]
		try:
			observed = eval(observed_str)
			if observed != expected:
				print('Failure on Test', i, ':', key, 'Expected', expected, 'but got', repr(observed))
			else:
				print('Test', i, 'ok')
		except BaseException as e:
			print('Failure on Test', i, ':', key, 'Expected', expected, 'but got Exception:', e)


if __name__ == '__main__':
	p = subprocess.Popen(['sh', 'start.sh'])
	time.sleep(1)
	try:
		main()
	except BaseException as e:
		print(e)
	finally:
		os.killpg(os.getpgid(p.pid), signal.SIGTERM)
