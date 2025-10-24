from django.apps import AppConfig
from django.conf import settings

class AqiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api.aqi'
    label = 'aqi'

    def ready(self):
        """
        Khởi động scheduler khi server chạy
        """
        import sys
        
        # Chỉ chạy khi chạy server (runserver hoặc gunicorn)
        # Tránh chạy khi migrate hoặc các lệnh manage.py khác
        is_server = 'runserver' in sys.argv or 'gunicorn' in sys.argv
        
        if is_server:
            from . import jobs
            from django_apscheduler.jobstores import DjangoJobStore
            from apscheduler.schedulers.background import BackgroundScheduler
            
            scheduler = BackgroundScheduler(timezone=settings.TIME_ZONE)
            scheduler.add_jobstore(DjangoJobStore(), "default")

            print("Đang khởi tạo AQI Scheduler...")
            scheduler.add_job(
                jobs.update_all_aqi_points,
                trigger='interval',
                minutes=15,
                id='update_all_aqi_points', # ID duy nhất của job
                max_instances=1,
                replace_existing=True,
            )
            
            try:
                scheduler.start()
                print("Scheduler AQI đã bắt đầu.")
            except Exception as e:
                print(f"Lỗi khi khởi động scheduler AQI: {e}")
