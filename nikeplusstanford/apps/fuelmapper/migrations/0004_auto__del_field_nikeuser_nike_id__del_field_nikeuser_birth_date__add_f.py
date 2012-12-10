# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting field 'NikeUser.nike_id'
        db.delete_column('fuelmapper_nikeuser', 'nike_id')

        # Deleting field 'NikeUser.birth_date'
        db.delete_column('fuelmapper_nikeuser', 'birth_date')

        # Adding field 'NikeUser.upm_user_id'
        db.add_column('fuelmapper_nikeuser', 'upm_user_id',
                      self.gf('django.db.models.fields.CharField')(default='', unique=True, max_length=200),
                      keep_default=False)

        # Adding field 'NikeUser.year_birthdate'
        db.add_column('fuelmapper_nikeuser', 'year_birthdate',
                      self.gf('django.db.models.fields.DateField')(default=datetime.datetime(2012, 12, 9, 0, 0)),
                      keep_default=False)


    def backwards(self, orm):
        # Adding field 'NikeUser.nike_id'
        db.add_column('fuelmapper_nikeuser', 'nike_id',
                      self.gf('django.db.models.fields.CharField')(default='', max_length=200, unique=True),
                      keep_default=False)

        # Adding field 'NikeUser.birth_date'
        db.add_column('fuelmapper_nikeuser', 'birth_date',
                      self.gf('django.db.models.fields.DateField')(default=datetime.datetime(2012, 12, 9, 0, 0)),
                      keep_default=False)

        # Deleting field 'NikeUser.upm_user_id'
        db.delete_column('fuelmapper_nikeuser', 'upm_user_id')

        # Deleting field 'NikeUser.year_birthdate'
        db.delete_column('fuelmapper_nikeuser', 'year_birthdate')


    models = {
        'fuelmapper.nikerun': {
            'Meta': {'object_name': 'NikeRun'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'nike_id': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        },
        'fuelmapper.nikesportactivity': {
            'Meta': {'object_name': 'NikeSportActivity'},
            'active_time_secs': ('django.db.models.fields.FloatField', [], {}),
            'activity_type_id': ('django.db.models.fields.IntegerField', [], {}),
            'calories': ('django.db.models.fields.IntegerField', [], {}),
            'country': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'distance': ('django.db.models.fields.FloatField', [], {}),
            'dst_offset': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'duration': ('django.db.models.fields.IntegerField', [], {}),
            'fuel_amt': ('django.db.models.fields.IntegerField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'nike_plus_user_id': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '200', 'null': 'True'}),
            'nike_user': ('django.db.models.fields.related.ForeignKey', [], {'default': 'None', 'to': "orm['fuelmapper.NikeUser']", 'null': 'True', 'on_delete': 'models.SET_NULL'}),
            'postal_code': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'sport_activity_id': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '200'}),
            'start_time_local': ('django.db.models.fields.DateTimeField', [], {}),
            'steps': ('django.db.models.fields.IntegerField', [], {}),
            'timezone_name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'tz_offset': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'upm_user_id': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '200', 'null': 'True'})
        },
        'fuelmapper.nikeuser': {
            'Meta': {'object_name': 'NikeUser'},
            'country': ('django.db.models.fields.CharField', [], {'default': 'None', 'max_length': '40'}),
            'gender': ('django.db.models.fields.IntegerField', [], {'default': 'None'}),
            'height': ('django.db.models.fields.FloatField', [], {'default': 'None'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'postal_code': ('django.db.models.fields.CharField', [], {'default': 'None', 'max_length': '24'}),
            'upm_user_id': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '200'}),
            'weight': ('django.db.models.fields.FloatField', [], {'default': 'None'}),
            'year_birthdate': ('django.db.models.fields.DateField', [], {'default': 'None'})
        },
        'fuelmapper.postalcode': {
            'Meta': {'object_name': 'PostalCode'},
            'country': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '40', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'lat': ('django.db.models.fields.FloatField', [], {'default': '0', 'null': 'True', 'blank': 'True'}),
            'lng': ('django.db.models.fields.FloatField', [], {'default': '0', 'null': 'True', 'blank': 'True'}),
            'northeast_lat': ('django.db.models.fields.FloatField', [], {'default': '0', 'null': 'True', 'blank': 'True'}),
            'northeast_lng': ('django.db.models.fields.FloatField', [], {'default': '0', 'null': 'True', 'blank': 'True'}),
            'postalcode': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '24'}),
            'southwest_lat': ('django.db.models.fields.FloatField', [], {'default': '0', 'null': 'True', 'blank': 'True'}),
            'southwest_lng': ('django.db.models.fields.FloatField', [], {'default': '0', 'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['fuelmapper']