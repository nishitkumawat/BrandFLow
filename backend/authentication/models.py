from django.db import models

# Create your models here.
class Company(models.Model):
    username = models.CharField(max_length=200)
    company_name = models.TextField(blank=True)
    email = models.EmailField()
    company_phone_no = models.CharField(max_length=20)
    phone_no= models.CharField(max_length=20)
    company_address = models.TextField(blank=True)
    login_email = models.EmailField(default="default@example.com")

    def __str__(self):
        return f"Completed: {self.title}"
    