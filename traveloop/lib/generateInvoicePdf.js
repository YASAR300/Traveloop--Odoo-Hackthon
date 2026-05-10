import { jsPDF } from "jspdf";
import "jspdf-autotable";

export const generateInvoicePdf = (data) => {
  const doc = new jsPDF();
  const { trip, lineItems, subtotal, tax, discount, grandTotal, budget } = data;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("TRAVELOOP", 14, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("traveloop.com", 14, 26);
  
  doc.setFontSize(18);
  doc.text("INVOICE", 170, 20, { align: "right" });

  doc.setLineWidth(0.5);
  doc.line(14, 32, 196, 32);

  // Info Section
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 14, 45);
  doc.setFont("helvetica", "normal");
  const userName = trip.user ? `${trip.user.firstName} ${trip.user.lastName}` : "Valued Customer";
  doc.text(userName, 14, 50);

  doc.setFont("helvetica", "bold");
  doc.text(`Invoice #: ${trip.invoiceId}`, 196, 45, { align: "right" });
  doc.text(`Date: ${trip.invoiceGeneratedAt ? new Date(trip.invoiceGeneratedAt).toLocaleDateString() : new Date().toLocaleDateString()}`, 196, 50, { align: "right" });

  doc.line(14, 58, 196, 58);

  // Trip Details
  doc.setFont("helvetica", "bold");
  doc.text("TRIP DETAILS:", 14, 68);
  doc.setFont("helvetica", "normal");
  doc.text(`Trip: ${trip.name}`, 14, 74);
  const dateStr = `${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}`;
  doc.text(`Dates: ${dateStr}`, 14, 79);
  const cities = trip.stops.map(s => s.city.name).join(", ");
  doc.text(`Cities: ${cities} (${trip.stops.length})`, 14, 84);

  // Table
  const tableRows = lineItems.map((item, index) => [
    index + 1,
    item.category.toLowerCase(),
    item.description || "-",
    item.billingDetails || item.quantity || "1",
    `$${item.unitCost || item.amount}`,
    `$${item.amount}`
  ]);

  doc.autoTable({
    startY: 95,
    head: [['#', 'Category', 'Description', 'Qty/Details', 'Unit Cost', 'Amount']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    styles: { font: "helvetica", fontSize: 9 }
  });

  const finalY = doc.lastAutoTable.finalY + 10;

  // Totals
  doc.setFont("helvetica", "bold");
  doc.text(`Subtotal: $${subtotal.toLocaleString()}`, 196, finalY, { align: "right" });
  doc.text(`Tax (${trip.taxPercent}%): $${tax.toLocaleString()}`, 196, finalY + 7, { align: "right" });
  doc.text(`Discount: $${discount.toLocaleString()}`, 196, finalY + 14, { align: "right" });
  
  doc.setFontSize(14);
  doc.text(`GRAND TOTAL: $${grandTotal.toLocaleString()}`, 196, finalY + 25, { align: "right" });

  doc.setLineWidth(0.5);
  doc.line(14, finalY + 30, 196, finalY + 30);

  // Budget Insights
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Status: " + trip.invoiceStatus.toUpperCase(), 14, finalY + 40);
  
  doc.text("budget Insights:", 14, finalY + 50);
  doc.setFont("helvetica", "normal");
  const remaining = budget.totalBudget - subtotal;
  doc.text(`Budget: $${budget.totalBudget.toLocaleString()} | Spent: $${subtotal.toLocaleString()}`, 14, finalY + 56);
  doc.text(`Remaining: $${remaining.toLocaleString()}`, 14, finalY + 62);

  doc.save(`invoice-${trip.invoiceId}.pdf`);
};
