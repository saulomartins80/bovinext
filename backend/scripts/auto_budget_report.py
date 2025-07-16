# 📂 backend/scripts/auto_budget_report.py  
# Gera relatórios financeiros automáticos e envia por e-mail  
def generate_budget_report(user_email):
    data = FinancialData.fetch(user_email)
    report = AIReportBuilder.create(data)
    PDFExporter.export(report)
    EmailService.send(user_email, "Seu relatório mensal!", report) 