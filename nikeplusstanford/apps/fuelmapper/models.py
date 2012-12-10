from django.db import models
import httplib2
import json

class NikeUser(models.Model):
    upm_user_id = models.CharField(max_length=200, unique=True)
    gender = models.IntegerField(default=None, null=True)
    postal_code = models.CharField(max_length=24, default=None)
    height = models.FloatField(default=None, null=True)
    weight = models.FloatField(default=None, null=True)
    country = models.CharField(max_length=40, default=None, null=True)
    year_birthdate = models.IntegerField(default=0, null=True)

    def calculate_age(born):
	    today = date.today()
	    try: # raised when birth date is February 29 and the current year is not a leap year
	        birthday = born.replace(year=today.year)
	    except ValueError:
	        birthday = born.replace(year=today.year, day=born.day-1)
	    if birthday > today:
	        return today.year - born.year - 1
	    else:
	        return today.year - born.year


    def get_fields(self):
    	return [(field.name, field.value_to_string(self)) for field in NikeSportActivity._meta.fields]

    def __unicode__(self):
    	return self.upm_user_id

class NikeSportUser(models.Model):
    upm_user_id = models.CharField(max_length=200, unique=True)
    gender = models.IntegerField(default=None, null=True)
    postal_code = models.CharField(max_length=24, default=None)
    height = models.FloatField(default=None, null=True)
    weight = models.FloatField(default=None, null=True)
    country = models.CharField(max_length=40, default=None, null=True)
    year_birthdate = models.IntegerField(default=0, null=True)

    def calculate_age(born):
	    today = date.today()
	    try: # raised when birth date is February 29 and the current year is not a leap year
	        birthday = born.replace(year=today.year)
	    except ValueError:
	        birthday = born.replace(year=today.year, day=born.day-1)
	    if birthday > today:
	        return today.year - born.year - 1
	    else:
	        return today.year - born.year


    def get_fields(self):
    	return [(field.name, field.value_to_string(self)) for field in NikeSportActivity._meta.fields]

    def __unicode__(self):
    	return self.upm_user_id

class NikeRun(models.Model):
    nike_id = models.CharField(max_length=200)

    def __unicode__(self):
        return self.nike_id

class NikeSportActivity(models.Model):
	sport_activity_id = models.CharField(max_length=200, unique=True)
	upm_user_id = models.CharField(max_length=200, null=True, default='')
	nike_plus_user_id = models.CharField(max_length=200, null=True, default='')
	nike_user = models.ForeignKey(NikeUser, null=True, on_delete=models.SET_NULL, default=None)
	activity_type_id = models.IntegerField()
	tz_offset = models.CharField(max_length=200)
	start_time_local = models.DateTimeField()
	duration = models.IntegerField()
	calories = models.IntegerField()
	distance = models.FloatField()
	steps = models.IntegerField()
	fuel_amt = models.IntegerField()
	dst_offset = models.CharField(max_length=200)
	timezone_name = models.CharField(max_length=200)
	active_time_secs = models.FloatField()
	postal_code = models.CharField(max_length=200)
	country = models.CharField(max_length=200)

	def get_fields(self):
		return [(field.name, field.value_to_string(self)) for field in NikeSportActivity._meta.fields]

	def __unicode__(self):
		return str(self.sport_activity_id)

class PostalCode(models.Model):
	postalcode = models.CharField(max_length=24, unique=True)
	country = models.CharField(max_length=40, blank=True, default='')
	lat = models.FloatField(blank=True, null=True, default=0)
	lng = models.FloatField(blank=True, null=True, default=0)
	northeast_lat = models.FloatField(blank=True, null=True, default=0)
	northeast_lng = models.FloatField(blank=True, null=True, default=0)
	southwest_lat = models.FloatField(blank=True, null=True, default=0)
	southwest_lng = models.FloatField(blank=True, null=True, default=0)

	@classmethod
	def find_or_create_code(cls, postalcode):
		obj, created = cls.objects.get_or_create(postalcode=postalcode)
		if created is True:
			h = httplib2.Http()
			request_url = 'http://maps.googleapis.com/maps/api/geocode/json?address=%s&sensor=false' % postalcode
			response, content = h.request(request_url)
			jsonResponse = json.loads(content)
			print content
			print jsonResponse
			geometry = jsonResponse['results'][0]['geometry']
			obj.postalcode = postalcode
			print geometry
			obj.lat = geometry['location']['lat']
			obj.lng = geometry['location']['lng']
			obj.northeast_lat = geometry['viewport']['northeast']['lat']
			obj.northeast_lng = geometry['viewport']['northeast']['lng']
			obj.southwest_lat = geometry['viewport']['southwest']['lat']
			obj.southwest_lng = geometry['viewport']['southwest']['lng']
			obj.save()
		return obj

	def __unicode__(self):
		return '%s: location %f %f' % (self.postalcode, self.lat, self.lng)

