# Generated by Django 2.1.4 on 2020-02-27 13:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('terms', '0009_auto_20200227_1329'),
        ('lemmas', '0002_lemma_concept'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='lemma',
            name='concept',
        ),
        migrations.AddField(
            model_name='lemma',
            name='concept',
            field=models.ManyToManyField(null=True, related_name='terms', to='terms.Concept'),
        ),
    ]
