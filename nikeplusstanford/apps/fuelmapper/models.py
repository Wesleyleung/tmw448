from django.db import models

class NikeUser(models.Model):
    nike_id = models.CharField(max_length=200, unique=True)
    gender = models.IntegerField(default=None)
    postal_code = models.CharField(max_length=24, default=None)
    height = models.FloatField(default=None)
    weight = models.FloatField(default=None)
    country = models.CharField(max_length=40, default=None)
    birth_date = models.DateField(default=None)

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
    	return self.get_fields()

class NikeRun(models.Model):
    nike_id = models.CharField(max_length=200)

    def __unicode__(self):
        return self.nike_id

class NikeSportActivity(models.Model):
	sport_activity_id = models.CharField(max_length=40, unique=True)
	upm_user_id = models.CharField(max_length=40)
	nike_plus_user_id = models.CharField(max_length=40)
	nike_user = models.ForeignKey(NikeUser, null=True, on_delete=models.SET_NULL)
	activity_type_id = models.IntegerField()
	tz_offset = models.CharField(max_length=20)
	start_time_local = models.DateTimeField()
	duration = models.IntegerField()
	calories = models.IntegerField()
	distance = models.FloatField()
	steps = models.IntegerField()
	fuel_amt = models.IntegerField()
	dst_offset = models.CharField(max_length=20)
	timezone_name = models.CharField(max_length=120)
	active_time_secs = models.FloatField()
	postal_code = models.CharField(max_length=24)
	country = models.CharField(max_length=40)

	def get_fields(self):
		return [(field.name, field.value_to_string(self)) for field in NikeSportActivity._meta.fields]

	def __unicode__(self):
		return str(self.get_fields())

