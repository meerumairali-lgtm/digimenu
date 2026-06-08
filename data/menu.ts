export const menu: Record<string, Restaurant> = {
  "spicy-box": {
    name: "Spicy Box Fast Food and Grill",
    tagline: "Taste the Spice!",
    address: "123 Food Street, Karachi, Pakistan",
    phone: "+92-300-1234567",
    whatsapp: "+92-300-1234567",
    email: "info@spicybox.com",
    instagram: "https://instagram.com/spicybox",
    facebook: "https://facebook.com/spicybox",
    categories: [
      {
        title: "Burgers",
        items: [
          { name: "Chicken Burger", price: 250, description: "Crispy chicken with fresh veggies" },
          { name: "Zinger Burger", price: 350, description: "Spicy zinger patty with special sauce" },
        ],
      },
      {
        title: "Wraps",
        items: [
          { name: "Chicken Wrap", price: 300, description: "Grilled chicken in soft tortilla" },
          { name: "Zinger Wrap", price: 380, description: "Spicy zinger wrapped with veggies" },
        ],
      },
      {
        title: "BBQ",
        items: [
          { name: "Chicken Tikka", price: 200, description: "Marinated grilled chicken tikka" },
          { name: "Seekh Kebab", price: 180, description: "Juicy minced meat kebabs" },
        ],
      },
    ],
  },
};

export type MenuItem = {
  name: string;
  price: number;
  description?: string;
  image?: string;
};

export type Category = {
  title: string;
  items: MenuItem[];
};

export type Restaurant = {
  name: string;
  tagline?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  categories: Category[];
};