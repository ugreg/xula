public class Node {
    int data;
    Node next;

    Node(int data) {
        this.data = data;
        this.next = null;
    }
}

public class LinkedList {
    Node head;

    public LinkedList() {
        this.head = null;
    }

    public LinkedList(int num) {
        this.head = new Node(num);
    }

    public void add(int data) {
        Node newNode = new Node(data);
        Node current = this.head;
        if (current == null) {
            System.out.println("Added node (" + data + ") to empty list");
            this.head = newNode;
        } else {
            while (current.next != null) {
                current = current.next;
            }
            System.out.println("Added node (" + data + ")");
            current.next = newNode;
        }
    }

    public void delete(int data) {
        Node current = this.head;
        Node previous = null;

        if (current != null && current.data == data) {
            System.out.println("Deleted node (" + data + ")");
            this.head = this.head.next;
        } else {
            while (current.next != null && current.data != data) {
                previous = current;
                current = current.next;
            }
            if (current.data == data) {         
                System.out.println("Deleted node (" + data + ")");       
                previous.next = current.next;
            }
        }
    }

    public void print() {
        Node current = this.head;
        if (current == null) {
            System.out.println("List empty!");            
        } else {
            while (current != null) {
                System.out.print(current.data + " -> ");
                current = current.next;
            }
            System.out.println("null");
        }
    }
}

public class LinkedListDemo { 
    public static void main(String[] args) {
        LinkedList list = new LinkedList();
        list.add(2);
        list.add(11);
        list.add(45);
        list.add(100);
        list.add(34);
        list.print();
        list.delete(2);
        list.delete(34);
        list.delete(45);
        list.delete(0);
        list.print();
        System.out.println("Done");
    }
}
