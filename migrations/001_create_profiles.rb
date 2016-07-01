Sequel.migration do
  up do
    create_table :profiles do
     primary_key :id
     DateTime :created_at
     DateTime :updated_at
     String :firstName
     String :lastName
     String :imgurl
     String :email
     String :objective
   end
  end

  down do
    drop_table :profiles
  end
end