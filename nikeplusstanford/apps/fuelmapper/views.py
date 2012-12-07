from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
import json

def index(request):
	context = {}
	return render(request, 'fuelmapper/index.html', context)
