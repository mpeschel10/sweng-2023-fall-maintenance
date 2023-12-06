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
	"id": 6,
	"username": random_name(),
	"password": "password",
	"kind": random.choice(('TENANT', 'MAINTENANCE', 'MANAGER')),
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

test_post_request_expected = [{
	"id": 5,
	"tenant": 4,
	"apartment": "97d",
	"location": random_name(),
	"description": random_name(),
	"datetime": round(time.time()),
	"photo": "/uploads/peewee_nightmare_afro_corgi.png",
	"status": "PENDING",
}]

def test_post_request():
	files = dict()
	for key, value in test_post_request_expected[0].items():
		files[key] = (None, value) # The first None is the filename; if filename is None, that means it's a field not a file.
	del files['apartment']
	del files['datetime']
	del files['status']
	files['id'] = (None, 4)

	response = requests.post('http://localhost/request', files=files)
	print('test post request: response.status_code:', response.status_code)
	print('test post request: response.content:', response.content)
	request_id = response.json()

	params = {'id': str(request_id)}
	response = requests.get('http://localhost/request', params=params)
	print('test post request: response.status_code:', response.status_code)
	print('test post request: response.content:', response.content)
	return response.json()

def test_post_request_comparison(observed, expected):
	observed_timestamp = observed[0]['datetime']
	expected_timestamp = expected[0]['datetime']
	del observed[0]['datetime']
	del expected[0]['datetime']
	# print('comparing datetimes ', observed_timestamp, expected_timestamp)
	return observed_timestamp >= expected_timestamp and observed == expected


tests = {
	'get request' : ("curl('localhost/request')", b'[{"id":1,"tenant":1,"apartment":"255a","location":"Kitchen ceiling","description":"Just got to Dublin, Ireland. Technically it\xe2\x80\x99s 6am here. I\xe2\x80\x99m sitting alone at the kitchen table in the airbnb/apartment while K and her sister Y take an hour-long nap in their respective bedrooms. I\xe2\x80\x99ve just put on a lidocaine patch to ease my abdominal pain and that and the hot tea coursing through me are working wonders at stilling the pain, or at least obviating it from central consciousness \xe2\x80\x94 this despite me writing about it now (though that itself is another way of distancing myself from the pain).\\n\\nLoud birds, seagulls, first thing I heard when we stepped out of the taxi on Great George\xe2\x80\x99s Street. And the bracing cold. Pleasant, not biting. It is September, after all. Pink flowers on the windowsill. Large almost floor to ceiling window. Gray sky. Pleasantly old buildings all stacked against each other. Something soft and easy here. I know it isn\xe2\x80\x99t; I know the thing I am thinking of is an illusion, for I am a tourist and naive in many things, but I cannot help but feel that to live here would be to be at some sort of peace.\\n\\nBuilding opposite. I can see the roof of an ugly gray building. All concrete. The top floor\xe2\x80\x99s window has some sort of vines growing out of a grate. Plants stacked in the window. The roof above it plants everywhere. Or most places. Can see the leaves waving in the breeze every few seconds. A puff of cloud passing by against the gray sky. Something blue in the sky, almost. A slight blueness to the cloudy background as the white puff progresses, passes, and finally disappears behind a brick building.\\n\\nNothing special to the apartment. Those general slightly off-kilter appliances of another country. The toilet slightly different. Every appliance not quite the same. No microwave. God the tea feels good.\\n","datetime":1699825975,"photo":"/uploads/kitchen.png","status":"PENDING"},{"id":2,"tenant":1,"apartment":"12j","location":"Sitting room","description":"Like many men who\xe2\x80\x99d undersocialized in their youth, who\xe2\x80\x99d overcome that isolation by seeking out groups in college, he had developed an affectation, a specific adaptation. Every now and then, in little pockets of silence, he\xe2\x80\x99d say something witty or funny, often both. He knew his audience, and he knew who was drunk enough to laugh, and if her laugh was infectious, warm, capable of inspiring further laughter. But this man, these type of men, are by their solitude (or its lifelong aftereffects) incapable of one on one conversation. They lack. I saw it one day, after we\xe2\x80\x99d left a board game party at Frisbie\xe2\x80\x99s place. Frisbie\xe2\x80\x99s apartment was downtown, in a richer section of the city, and since we were there anyway, we went to lunch. There he was silent, taciturn, evasive. I had seen this before, in other men, and I understood it now. He lacked the capacity to understand the person in front of him. He groped blindly in the dark. His solution was to alight on subjects he imagined we both had in common. The difficulty was he used language as a means to communicate the past day\xe2\x80\x99s reading of online news, aggregators, social media. So he used the language of what he had read, spoke in memes, witless aphorisms (this in contrast with the prepared remarks he used to break lulls at parties, that only seemed witty, but repeat contact with the man proved them otherwise).","datetime":1699919329,"photo":"/uploads/shades.png","status":"PENDING"},{"id":3,"tenant":1,"apartment":"469","location":"Sidewalk","description":"I saw something strange a few months ago in the newspaper. A man had died. And instead of a single paid obituary he had nearly a dozen. Hundreds of lines, and this was in The New York Times, where obituaries cost over $250 for the first four lines and around $50 for every subsequent line. I counted and there must have been over $5000 spent on his obituaries. They were from various Charitable Organizations, all full of encomia, high praise for this philanthropist, Eugene Grant. The longest of the obituaries ran for an entire column, dozens of lines, a two thousand dollar obituary. It was a recapitulation of his life. How he had changed his name from Greenfeld, gone into real estate, become a philanthropist.\\n\\nAnd I tell you all of this because near the bottom of that obituary was a quote of his that I have found worth repeating. It said he believed there were three things that made a good and full life: to find and do something meaningful, to be a member of your community, and to give love.\\n\\nWhich is more or less why I\xe2\x80\x99ve decided to become a tree.\\n\\nI am always staring at the trees in my yard, the branches and their leaves. The giving trees, the taking-it trees, the redwoods and magnolias, the japanese maple. I understand now I have been preparing to become a tree for years. When I was young and our class forced to do school plays by our teacher I was always chosen, out of some thirty or more students, to be inanimate. I have played desks and chairs and rocks, but above all, trees. I have spread my arms and let green and yellow crayon-colored paper leaves dangle there for minutes while all about me quick-moving children misspoke their lines. I remember feeling ancient even then. Life came to me in seasons. I carved air with sunlight, drew myself up from the earth, communed with vast networks of roots and fungi, underground skeins of thought. And I know what I am. A redwood in a redwood forest, surrounded by my community of trees and more, a solar-powered carbon sequestration natural wonder, home for thousands. Feeding by the sugarload all the fungi beneath my trunk. Trading, storing, abiding, shaking. And after a thousand years have passed I will return to my old self, renounce my roots, see once more the world through human eyes. See how far we have come, and gone, if the Moon is criss-crossed by human settlement. If Mars too is settled, its moons, what life there might be on Europa, on Titan. Or life still stranger yet, flowers of ice and rock to focus sunlight in the Oort cloud, drawing vital energy even at that improbable distance. And farther yet into other systems. Taking a starship there. I think I\xe2\x80\x99d like that very much. To see worlds and skies other than these.\\n","datetime":1699919420,"photo":"/uploads/sidewalk_needs_edging.png","status":"COMPLETE"},{"id":4,"tenant":1,"apartment":"West building","location":"Bathroom/living room","description":"Page 660 waited three years to be read. In that time it went from paper mill to warehouse to bookstore to bookshelf to used bookstore. It learned all this from pages 659 and 661, who themselves learned it from 658 and 662 all the way forward and back to the front and back covers. They saw the teddy-bear faced used bookstore owner who arrived promptly at 7:30am every morning, stayed until 6:30pm, they saw the high school students, who worked at his bookstore from 3pm to 6pm. Everything they learned they passed on to the inner pages, to the signatures and leafs, who passed it on in a multi-hundred page game of telephone (occasionally skipping blank pages), each page interpreting as well as it could based on what it knew, which, more or less, consisted of the some three hundred words it contained. Some pages then, near the end of the book, were, at first, illiterate. Others by dint of their confined vocabulary espoused strange theories of the world, often self-allotting confidence in proportion to their ignorance.\\n\\nBut the book as a whole was wise, intelligent, well read, or the product of someone well read, though even they had a hard time imagining they had been written by some intelligent designer. It seemed rather they had simply sprung out of some primordial pulp, fully formed and literate, a bound union of words, individually knowing quite little, but together having an inordinate knowledge of the world. The tragedy then, as page 660 was the first to discover, was that the world they had conceived for themselves in their own words, was very unlike the unbound world. Here beyond their borders were creatures who moved independently, whose binding, if they were bound, whose words, if they had any, were secreted away and unopenable, illegible. They spoke and they wrote and it took the book a long time to learn how exactly this had occurred. This sundering of book and creature, as if far back in time they had coincided in a single point, and only now as the universe cooled found themselves differentiated into something a little more complex. This epiphany, or knowledge, coming from a nearby Cosmology Textbook on the shelf next to them, settled there by geometric coincidence and the inevitable squeeze of a used book store with the cities rising rent prices and acquisitive landlords, their faces frozen into perpetual $ _ $, price per square foot rising from cents to multiple dollars, doubling, then tripling, and the used bookstores getting ever smaller, bookshelves rising to the ceilings, walkways narrowing, the wondrous sprawl of fiction eliding with increasingly esoteric subgenres of creative nonfiction.","datetime":1699919426,"photo":"/uploads/hot_tap_not_working.png","status":"PENDING"}]'),
	'post request' : ('test_post_request()', test_post_request_expected, test_post_request_comparison),
	'get user' : ("curl('localhost/user')", b'[{"id":1,"username":"mpeschel10","password":"password","kind":"MANAGER"},{"id":2,"username":"steveadore","password":"password","kind":"MAINTENANCE"},{"id":3,"username":"rhearst4421","password":"password","kind":"TENANT"},{"id":4,"username":"jbezos303","password":"password","kind":"TENANT"},{"id":5,"username":"dgray01","password":"password","kind":"TENANT"}]'),
	'upload file': ("test_upload_file()", test_upload_file_expected),
	'post user': ("test_post_user()", test_post_user_expected),
}

def main():
	def equals(a, b): return a == b
	
	for i, key in enumerate(tests):
		test = tests[key]
		if len(test) == 2:
			(observed_str, expected) = test
			comparison = equals
		else:
			(observed_str, expected, comparison) = test
		
		try:
			observed = eval(observed_str)
			if comparison(observed, expected):
				print('Test', i, 'OK')
			else:
				print('Test', i, 'Failure:', key, 'Expected', expected, 'but got', repr(observed))
		except BaseException as e:
			print('Test', i, 'Failure:', key, 'Expected', expected, 'but got Exception:', e)
	



if __name__ == '__main__':
	p = subprocess.Popen(['sh', 'start.sh'])
	time.sleep(1)
	try:
		main()
	except BaseException as e:
		print(e)
	finally:
		os.killpg(os.getpgid(p.pid), signal.SIGTERM)
