#!/opt/bitnami/python/bin/python

# using SendGrid's Python Library
# https://github.com/sendgrid/sendgrid-python

import json
import sys
from pprint import pprint

import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import *

# read default data: JSON object with fields for...
  # subject: message subject line
  # text: default message
  # to: (default) TO address
  # from: FROM address
  # name: FROM name
  # key: sendgrid API key
data = json.load(open('/usr/local/etc/sendgrid.json'))
data['message'] = ''
#pprint(data)

# compose fields...
if len(sys.argv)>1:
  data["subject"] = sys.argv[1]
if len(sys.argv)>2:
  data["to"] = ','.join(sys.argv[2:])

# get message from input stream...
for line in sys.stdin:
  try:
    data["message"] += line
  except:
    data["message"] += "************* SKIPPED UNICODE ERROR *************\n"

# create message...
msg = Mail(
    from_email = data['from'],
    to_emails = data['to'],
    subject = data['subject'])

msg.content = Content(MimeType.text, data['message'])
msg.content = Content(MimeType.html, '<strong><pre>'+data['message']+'</pre></strong>')

try:
    sg = SendGridAPIClient(data['key'])
    response = sg.send(msg)
    pprint(response.status_code)
    pprint(response.body)
    pprint(response.headers)
except Exception as e:
    pprint(e.message)
