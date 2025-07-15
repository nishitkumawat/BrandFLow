from django.db import models

class Employee(models.Model):
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    experience = models.PositiveIntegerField(default=0)
    joining_date = models.DateField()
    salary = models.PositiveIntegerField()
    email = models.EmailField(unique=True,default="default@example.com")  # 🔥 New field added

    def __str__(self):
        return self.name
