# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):

        # Changing field 'NikeSportActivity.nike_plus_user_id'
        db.alter_column('fuelmapper_nikesportactivity', 'nike_plus_user_id', self.gf('django.db.models.fields.CharField')(max_length=200))

        # Changing field 'NikeSportActivity.sport_activity_id'
        db.alter_column('fuelmapper_nikesportactivity', 'sport_activity_id', self.gf('django.db.models.fields.CharField')(unique=True, max_length=200))

        # Changing field 'NikeSportActivity.dst_offset'
        db.alter_column('fuelmapper_nikesportactivity', 'dst_offset', self.gf('django.db.models.fields.CharField')(max_length=200))

        # Changing field 'NikeSportActivity.country'
        db.alter_column('fuelmapper_nikesportactivity', 'country', self.gf('django.db.models.fields.CharField')(max_length=200))

        # Changing field 'NikeSportActivity.tz_offset'
        db.alter_column('fuelmapper_nikesportactivity', 'tz_offset', self.gf('django.db.models.fields.CharField')(max_length=200))

        # Changing field 'NikeSportActivity.timezone_name'
        db.alter_column('fuelmapper_nikesportactivity', 'timezone_name', self.gf('django.db.models.fields.CharField')(max_length=200))

        # Changing field 'NikeSportActivity.postal_code'
        db.alter_column('fuelmapper_nikesportactivity', 'postal_code', self.gf('django.db.models.fields.CharField')(max_length=200))

        # Changing field 'NikeSportActivity.upm_user_id'
        db.alter_column('fuelmapper_nikesportactivity', 'upm_user_id', self.gf('django.db.models.fields.CharField')(max_length=200))

    def backwards(self, orm):

        # Changing field 'NikeSportActivity.nike_plus_user_id'
        db.alter_column('fuelmapper_nikesportactivity', 'nike_plus_user_id', self.gf('django.db.models.fields.CharField')(max_length=40))

        # Changing field 'NikeSportActivity.sport_activity_id'
        db.alter_column('fuelmapper_nikesportactivity', 'sport_activity_id', self.gf('django.db.models.fields.CharField')(max_length=40, unique=True))

        # Changing field 'NikeSportActivity.dst_offset'
        db.alter_column('fuelmapper_nikesportactivity', 'dst_offset', self.gf('django.db.models.fields.CharField')(max_length=20))

        # Changing field 'NikeSportActivity.country'
        db.alter_column('fuelmapper_nikesportactivity', 'country', self.gf('django.db.models.fields.CharField')(max_length=40))

        # Changing field 'NikeSportActivity.tz_offset'
        db.alter_column('fuelmapper_nikesportactivity', 'tz_offset', self.gf('django.db.models.fields.CharField')(max_length=20))

        # Changing field 'NikeSportActivity.timezone_name'
        db.alter_column('fuelmapper_nikesportactivity', 'timezone_name', self.gf('django.db.models.fields.CharField')(max_length=120))

        # Changing field 'NikeSportActivity.postal_code'
        db.alter_column('fuelmapper_nikesportactivity', 'postal_code', self.gf('django.db.models.fields.CharField')(max_length=24))

        # Changing field 'NikeSportActivity.upm_user_id'
        db.alter_column('fuelmapper_nikesportactivity', 'upm_user_id', self.gf('django.db.models.fields.CharField')(max_length=40))

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
            'nike_plus_user_id': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'nike_user': ('django.db.models.fields.related.ForeignKey', [], {'default': 'None', 'to': "orm['fuelmapper.NikeUser']", 'null': 'True', 'on_delete': 'models.SET_NULL'}),
            'postal_code': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'sport_activity_id': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '200'}),
            'start_time_local': ('django.db.models.fields.DateTimeField', [], {}),
            'steps': ('django.db.models.fields.IntegerField', [], {}),
            'timezone_name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'tz_offset': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'upm_user_id': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        },
        'fuelmapper.nikeuser': {
            'Meta': {'object_name': 'NikeUser'},
            'birth_date': ('django.db.models.fields.DateField', [], {'default': 'None'}),
            'country': ('django.db.models.fields.CharField', [], {'default': 'None', 'max_length': '40'}),
            'gender': ('django.db.models.fields.IntegerField', [], {'default': 'None'}),
            'height': ('django.db.models.fields.FloatField', [], {'default': 'None'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'nike_id': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '200'}),
            'postal_code': ('django.db.models.fields.CharField', [], {'default': 'None', 'max_length': '24'}),
            'weight': ('django.db.models.fields.FloatField', [], {'default': 'None'})
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