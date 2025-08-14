from django.db import models

class Employee(models.Model):
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    experience = models.PositiveIntegerField(default=0)
    joining_date = models.DateField()
    salary = models.PositiveIntegerField()
    email = models.EmailField(unique=True, default="default@example.com")

    def __str__(self):
        return self.name


class Team(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    lead = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='teams_led', null=True, blank=True)
    members = models.ManyToManyField(Employee, related_name="teams")

    def __str__(self):
        return self.name


class Task(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=50, default="Pending")
    completed = models.BooleanField(default=False)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, null=True, blank=True)
    assigned_to = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True)
    deadline = models.DateField(null=True, blank=True)
    is_moved_to_completed = models.BooleanField(default=False)

    total_checkpoints = models.PositiveIntegerField(default=0)
    completed_checkpoints = models.PositiveIntegerField(default=0)

    def completion_percentage(self):
        if self.total_checkpoints == 0:
            return 0
        return int((self.completed_checkpoints / self.total_checkpoints) * 100)

    def __str__(self):
        return self.title


class Checkpoint(models.Model):
    task = models.ForeignKey(Task, related_name="checkpoints", on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.title} ({'Completed' if self.completed else 'Pending'})"


class CompletedTask(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True)
    completion_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Completed: {self.title}"
