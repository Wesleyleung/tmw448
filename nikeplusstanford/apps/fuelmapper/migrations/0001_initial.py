# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'NikeUser'
        db.create_table('fuelmapper_nikeuser', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('nike_id', self.gf('django.db.models.fields.CharField')(unique=True, max_length=200)),
            ('gender', self.gf('django.db.models.fields.IntegerField')(default=None)),
            ('postal_code', self.gf('django.db.models.fields.CharField')(default=None, max_length=24)),
            ('height', self.gf('django.db.models.fields.FloatField')(default=None)),
            ('weight', self.gf('django.db.models.fields.FloatField')(default=None)),
            ('country', self.gf('django.db.models.fields.CharField')(default=None, max_length=40)),
            ('birth_date', self.gf('django.db.models.fields.DateField')(default=None)),
        ))
        db.send_create_signal('fuelmapper', ['NikeUser'])

        # Adding model 'NikeRun'
        db.create_table('fuelmapper_nikerun', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('nike_id', self.gf('django.db.models.fields.CharField')(max_length=200)),
        ))
        db.send_create_signal('fuelmapper', ['NikeRun'])

        # Adding model 'NikeSportActivity'
        db.create_table('fuelmapper_nikesportactivity', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('sport_activity_id', self.gf('django.db.models.fields.CharField')(unique=True, max_length=40)),
            ('upm_user_id', self.gf('django.db.models.fields.CharField')(max_length=40)),
            ('nike_plus_user_id', self.gf('django.db.models.fields.CharField')(max_length=40)),
            ('nike_user', self.gf('django.db.models.fields.related.ForeignKey')(default=None, to=orm['fuelmapper.NikeUser'], null=True, on_delete=models.SET_NULL)),
            ('activity_type_id', self.gf('django.db.models.fields.IntegerField')()),
            ('tz_offset', self.gf('django.db.models.fields.CharField')(max_length=20)),
            ('start_time_local', self.gf('django.db.models.fields.DateTimeField')()),
            ('duration', self.gf('django.db.models.fields.IntegerField')()),
            ('calories', self.gf('django.db.models.fields.IntegerField')()),
            ('distance', self.gf('django.db.models.fields.FloatField')()),
            ('steps', self.gf('django.db.models.fields.IntegerField')()),
            ('fuel_amt', self.gf('django.db.models.fields.IntegerField')()),
            ('dst_offset', self.gf('django.db.models.fields.CharField')(max_length=20)),
            ('timezone_name', self.gf('django.db.models.fields.CharField')(max_length=120)),
            ('active_time_secs', self.gf('django.db.models.fields.FloatField')()),
            ('postal_code', self.gf('django.db.models.fields.CharField')(max_length=24)),
            ('country', self.gf('django.db.models.fields.CharField')(max_length=40)),
        ))
        db.send_create_signal('fuelmapper', ['NikeSportActivity'])

        # Adding model 'PostalCode'
        db.create_table('fuelmapper_postalcode', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('postalcode', self.gf('django.db.models.fields.CharField')(unique=True, max_length=24)),
            ('country', self.gf('django.db.models.fields.CharField')(default='', max_length=40, blank=True)),
            ('lat', self.gf('django.db.models.fields.FloatField')(default=0, null=True, blank=True)),
            ('lng', self.gf('django.db.models.fields.FloatField')(default=0, null=True, blank=True)),
            ('northeast_lat', self.gf('django.db.models.fields.FloatField')(default=0, null=True, blank=True)),
            ('northeast_lng', self.gf('django.db.models.fields.FloatField')(default=0, null=True, blank=True)),
            ('southwest_lat', self.gf('django.db.models.fields.FloatField')(default=0, null=True, blank=True)),
            ('southwest_lng', self.gf('django.db.models.fields.FloatField')(default=0, null=True, blank=True)),
        ))
        db.send_create_signal('fuelmapper', ['PostalCode'])


    def backwards(self, orm):
        # Deleting model 'NikeUser'
        db.delete_table('fuelmapper_nikeuser')

        # Deleting model 'NikeRun'
        db.delete_table('fuelmapper_nikerun')

        # Deleting model 'NikeSportActivity'
        db.delete_table('fuelmapper_nikesportactivity')

        # Deleting model 'PostalCode'
        db.delete_table('fuelmapper_postalcode')


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
            'country': ('django.db.models.fields.CharField', [], {'max_length': '40'}),
            'distance': ('django.db.models.fields.FloatField', [], {}),
            'dst_offset': ('django.db.models.fields.CharField', [], {'max_length': '20'}),
            'duration': ('django.db.models.fields.IntegerField', [], {}),
            'fuel_amt': ('django.db.models.fields.IntegerField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'nike_plus_user_id': ('django.db.models.fields.CharField', [], {'max_length': '40'}),
            'nike_user': ('django.db.models.fields.related.ForeignKey', [], {'default': 'None', 'to': "orm['fuelmapper.NikeUser']", 'null': 'True', 'on_delete': 'models.SET_NULL'}),
            'postal_code': ('django.db.models.fields.CharField', [], {'max_length': '24'}),
            'sport_activity_id': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '40'}),
            'start_time_local': ('django.db.models.fields.DateTimeField', [], {}),
            'steps': ('django.db.models.fields.IntegerField', [], {}),
            'timezone_name': ('django.db.models.fields.CharField', [], {'max_length': '120'}),
            'tz_offset': ('django.db.models.fields.CharField', [], {'max_length': '20'}),
            'upm_user_id': ('django.db.models.fields.CharField', [], {'max_length': '40'})
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