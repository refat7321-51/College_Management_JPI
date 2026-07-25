from django.contrib import admin
from .models import UserAccount

@admin.register(UserAccount)
class UserAccountAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'role', 'department', 'mobile', 'email')
    list_filter = ('role', 'department', 'session', 'gender')
    search_fields = ('first_name', 'last_name', 'email', 'mobile', 'roll')
    ordering = ('-id',)
