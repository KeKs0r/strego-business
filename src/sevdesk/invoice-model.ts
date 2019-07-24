import { Status } from "./sevdesk";

export enum InvoiceType {
  RE = "RE"
}

export enum Currency {
  USD = "USD",
  EUR = "EUR"
}

export enum TaxRate {
  DEFAULT = "default",
  NOTEU = "noteu"
}

export enum Unit {
  PIECE = 1,
  BLANKET = 7, //Pauschal
  HOURS = 9,
  DAYS = 13
}

export enum ObjectName {
  Contact = "Contact",
  SevUser = "SevUser",
  Invoice = "Invoice",
  InvoicePos = "InvoicePos",
  Unit = "Unity"
}

interface TaxRateObject {
  taxText: number;
  taxRate: number;
  taxType: TaxRate;
}

type ObjectReference<ObjectType> = {
  id: number;
  objectName: ObjectType;
};

export type InvoiceInput = {
  // invoiceNumber: string;
  currency?: Currency;
  taxRate?: TaxRate;
  contactId: number;
  contactPersonId: number;
  invoiceDate?: Date | number;
  positions: Array<InvoicePosInput>;
  reference?: string;
  deliveryDate?: Date | number;
  deliveryDateUntil?: Date | number;
};

export type InvoiceDTO = {
  invoiceType: string;
  currency: Currency;
  status: Status;
  mapAll: boolean;
  objectName: ObjectName.Invoice;
  discount: boolean;
  contact: ObjectReference<ObjectName.Contact>;
  contactPerson: ObjectReference<ObjectName.SevUser>;
  invoiceDate: number;
  customerInternalNote?: string;
  timeToPay?: number;
  deliveryDate?: number;
  deliveryDateUntil?: number;
  header?: string;
  invoiceNumber?: string;
};

type InvoicePosInput = {
  name: string;
  quantity: number;
  price: number;
  unit: Unit;
};

type InvoicePosDTO = {
  objectName: ObjectName.InvoicePos;
  name: string;
  quantity: number;
  price: number;
  unity: ObjectReference<ObjectName.Unit>;
  mapAll: boolean;
};

export class InvoicePos {
  public name: string;
  public quantity: number;
  public price: number;
  public unit: Unit;
  public invoice: Invoice;

  constructor(invoice: Invoice, props: InvoicePosInput) {
    this.name = props.name;
    this.quantity = props.quantity;
    this.price = props.price;
    this.unit = props.unit;
    this.invoice = invoice;
  }

  getUnity(): ObjectReference<ObjectName.Unit> {
    return {
      id: this.unit,
      objectName: ObjectName.Unit
    };
  }
  toInput(): InvoicePosInput {
    return {
      name: this.name,
      quantity: this.quantity,
      price: this.price,
      unit: this.unit
    };
  }
  serialize(): InvoicePosDTO {
    return {
      name: this.name,
      quantity: this.quantity,
      price: this.price,

      objectName: ObjectName.InvoicePos,
      unity: this.getUnity(),
      mapAll: true,
      ...this.invoice.getTax()
    };
  }
}

type InvoiceRequest = {
  invoice: InvoiceDTO;
  invoicePosSave: Array<InvoicePosDTO>;
};

function serializeDate(date?: Date) {
  if (!date) {
    return undefined;
  }
  return date.getTime() / 1000;
}

export class Invoice {
  public invoiceNumber?: string;
  public header?: string;
  public currency: Currency;
  public taxRate: TaxRate;
  public contactId: number;
  public contactPersonId: number;
  public invoiceDate: Date;
  public positions: Array<InvoicePos> = [];
  public timeToPay: number = 30;
  public reference?: string;
  public deliveryDate?: Date;
  public deliveryDateUntil?: Date;

  private headerPrefix: String = "Invoice";

  constructor(props: InvoiceInput) {
    this.currency = props.currency || Currency.EUR;
    this.taxRate = props.taxRate || TaxRate.DEFAULT;
    this.contactId = props.contactId;
    this.contactPersonId = props.contactPersonId;
    this.invoiceDate = props.invoiceDate
      ? new Date(props.invoiceDate)
      : new Date();
    this.reference = props.reference;
    this.deliveryDate = props.deliveryDate
      ? new Date(props.deliveryDate)
      : undefined;
    this.deliveryDateUntil = props.deliveryDateUntil
      ? new Date(props.deliveryDateUntil)
      : undefined;
    this.positions = props.positions
      ? props.positions.map(p => new InvoicePos(this, p))
      : [];
  }

  setInvoiceNumber(invoiceNumber: string) {
    this.invoiceNumber = invoiceNumber;
    this.header = this.headerPrefix + " " + invoiceNumber;
  }

  addPosition(pos: InvoicePosInput) {
    this.positions = [...this.positions, new InvoicePos(this, pos)];
  }

  getTax(): TaxRateObject {
    const type = this.taxRate;
    switch (type) {
      case TaxRate.NOTEU: {
        return {
          taxType: type,
          taxRate: 0,
          taxText: 0
        };
      }
      default:
        return {
          taxType: TaxRate.DEFAULT,
          taxRate: 19,
          taxText: 19
        };
    }
  }

  toInput(): InvoiceInput {
    return {
      currency: this.currency,
      taxRate: this.taxRate,
      contactId: this.contactId,
      contactPersonId: this.contactPersonId,
      invoiceDate: this.invoiceDate && this.invoiceDate.getTime(),
      reference: this.reference,
      deliveryDate: this.deliveryDate && this.invoiceDate.getTime(),
      deliveryDateUntil: this.deliveryDateUntil && this.invoiceDate.getTime(),
      positions: this.positions.map(p => p.toInput())
    };
  }

  serialize(): InvoiceRequest {
    return {
      invoice: {
        invoiceNumber: this.invoiceNumber,
        header: this.header,
        invoiceType: "RE",
        status: Status.CREATED,
        invoiceDate: serializeDate(this.invoiceDate) as number,
        deliveryDate: serializeDate(this.deliveryDate),
        deliveryDateUntil: serializeDate(this.deliveryDateUntil),
        currency: this.currency,
        timeToPay: this.timeToPay,
        ...this.getTax(),
        mapAll: true,
        objectName: ObjectName.Invoice,
        discount: true,
        contact: {
          id: this.contactId,
          objectName: ObjectName.Contact
        },
        contactPerson: {
          id: this.contactPersonId,
          objectName: ObjectName.SevUser
        }
      },
      invoicePosSave: this.positions.map(p => p.serialize())
    };
  }
}
